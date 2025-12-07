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

    const { bookingId, hasDamage, damageDescription, damageCost } = await req.json();

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

    // Load profiles separately
    const [{ data: ownerProfile, error: ownerErr }, { data: renterProfile, error: renterErr }] =
      await Promise.all([
        supabase.from('profiles').select('full_name,email').eq('id', booking.items.owner_id).single(),
        supabase.from('profiles').select('full_name,email').eq('id', booking.renter_id).single(),
      ]);

    if (ownerErr || !ownerProfile) {
      throw new Error('Owner profile not found');
    }
    if (renterErr || !renterProfile) {
      throw new Error('Renter profile not found');
    }

    // Verify user is the owner
    if (booking.items.owner_id !== user.id) {
      throw new Error('Only the owner can confirm return');
    }

    // Verify booking is in picked_up or returned_waiting_owner status
    if (booking.status !== 'picked_up' && booking.status !== 'returned_waiting_owner') {
      throw new Error('Booking must be picked up before confirming return');
    }

    if (hasDamage) {
      // Handle damage case - capture deposit
      if (!damageCost || damageCost <= 0) {
        throw new Error('Damage cost is required when reporting damage');
      }

      // Create return evidence record
      if (damageDescription) {
        await supabase.from('return_evidence').insert({
          booking_id: bookingId,
          damage_description: damageDescription,
          damage_cost: damageCost,
          created_at: new Date().toISOString(),
        });
      }

      // Call manage-deposit function to capture
      const captureResponse = await fetch(`${supabaseUrl}/functions/v1/manage-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          action: 'capture',
          bookingId,
          amount: damageCost,
        }),
      });

      if (!captureResponse.ok) {
        const error = await captureResponse.json();
        throw new Error(`Failed to capture deposit: ${error.error}`);
      }

      // Send email to renter about deposit capture
      const refundAmount = booking.deposit_amount - damageCost;
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: renterProfile.email,
          subject: `Deposit Partially Captured: ${booking.items.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ea580c;">⚠️ Deposit Partially Captured</h2>
              <p>Hi ${renterProfile.full_name},</p>
              <p>The owner has reported damage to the rented item and captured a portion of your security deposit.</p>
              
              <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${booking.items.title}</h3>
                <p><strong>Original Deposit:</strong> €${booking.deposit_amount.toFixed(2)}</p>
                <p><strong>Amount Captured:</strong> €${damageCost.toFixed(2)}</p>
                <p><strong>Amount Refunded:</strong> €${refundAmount.toFixed(2)}</p>
                <p><strong>Reason:</strong><br>${damageDescription || 'Damage reported'}</p>
              </div>
              
              <p>If you believe this charge is incorrect, please contact the owner or reach out to our support team.</p>
              <p>The Rentilia Team</p>
            </div>
          `,
        }),
      });

      return new Response(
        JSON.stringify({ success: true, status: 'deposit_captured', refundAmount }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // No damage - release deposit
      const releaseResponse = await fetch(`${supabaseUrl}/functions/v1/manage-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          action: 'release',
          bookingId,
        }),
      });

      if (!releaseResponse.ok) {
        const error = await releaseResponse.json();
        throw new Error(`Failed to release deposit: ${error.error}`);
      }

      // Send email to renter about deposit release
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: renterProfile.email,
          subject: `Deposit Released: ${booking.items.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">✅ Deposit Released!</h2>
              <p>Hi ${renterProfile.full_name},</p>
              <p>Great news! Your security deposit has been released.</p>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${booking.items.title}</h3>
                <p><strong>Deposit Amount:</strong> €${booking.deposit_amount.toFixed(2)}</p>
                <p style="color: #16a34a; font-weight: bold;">Status: Released</p>
              </div>
              
              <p>The hold on your card has been removed. You should see the funds available within 5-7 business days.</p>
              <p>Thank you for taking good care of the item!</p>
              <p>The Rentilia Team</p>
            </div>
          `,
        }),
      });

      return new Response(
        JSON.stringify({ success: true, status: 'closed_no_damage' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
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
