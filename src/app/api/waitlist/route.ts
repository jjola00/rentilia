import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  // Rate limit check
  const rateLimitKey = getRateLimitKey(request);
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { email } = await request.json();

    // Validate email
    const trimmedEmail = email?.trim().toLowerCase();
    if (!trimmedEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert into waitlist
    const { error } = await supabase
      .from('waitlist_signups')
      .insert({
        email: trimmedEmail,
        source: 'waitlist-page',
        confirmation_sent_at: new Date().toISOString(),
      });

    if (error) {
      if (error.code === '23505') {
        // Duplicate email - still return success
        return NextResponse.json({ success: true, duplicate: true });
      }
      throw error;
    }

    // Send confirmation email
    let emailSent = false;
    try {
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseAnonKey) {
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({
            to: trimmedEmail,
            subject: "You're on the Rentilia beta waitlist",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>You're in!</h2>
                <p>Thanks for joining the Rentilia beta waitlist.</p>
                <p>We'll email you when early access opens. You'll be the first to know when Rentilia launches.</p>
                <p style="margin-top: 24px;">- The Rentilia Team</p>
              </div>
            `,
          }),
        });
        emailSent = emailResponse.ok;
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process signup' },
      { status: 500 }
    );
  }
}
