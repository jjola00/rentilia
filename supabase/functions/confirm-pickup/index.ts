import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        items (
          owner_id,
          title
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Fetch renter profile separately (avoid FK relationship issues)
    const { data: renterProfile, error: renterError } = await supabase
      .from('profiles')
      .select('full_name,email')
      .eq('id', booking.renter_id)
      .single();

    if (renterError || !renterProfile) {
      throw new Error('Renter profile not found');
    }

    // Verify user is the owner
    if (booking.items.owner_id !== user.id) {
      throw new Error('Only the owner can confirm pickup');
    }

    // Verify booking is in paid status
    if (booking.status !== 'paid') {
      throw new Error('Booking must be in paid status to confirm pickup');
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'picked_up',
        pickup_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      throw updateError;
    }

    // Send confirmation email to renter
    const returnDate = new Date(booking.end_datetime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        to: renterProfile.email,
        subject: `Pickup Confirmed: ${booking.items.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">📦 Pickup Confirmed!</h2>
            <p>Hi ${renterProfile.full_name},</p>
            <p>The owner has confirmed that you've picked up <strong>${booking.items.title}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Return By:</strong> ${returnDate}</p>
              <p>Please return the item on time and in good condition.</p>
            </div>
            
            <p>Enjoy your rental!</p>
            <p>The Rentilia Team</p>
          </div>
        `,
      }),
    });

    return new Response(
      JSON.stringify({ success: true, status: 'picked_up' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
