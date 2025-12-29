import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Email service configuration
// For production, integrate with SendGrid, Resend, or similar
// For now, this logs emails (you'll need to add your email service)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from = 'Rentilia <onboarding@resend.dev>' }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html');
    }

    // If Resend API key is configured, send via Resend
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Resend API error:', error);
        throw new Error(`Failed to send email: ${error}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);

      return new Response(
        JSON.stringify({ success: true, id: result.id }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Fallback: Log email (for development/testing)
    console.log('=== EMAIL (No service configured) ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', html);
    console.log('=====================================');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email logged (no service configured)',
        to,
        subject,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
