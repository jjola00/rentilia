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
      // Handle damage case
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

      const { error: statusError } = await supabase
        .from('bookings')
        .update({
          status: 'deposit_captured',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (statusError) {
        throw statusError;
      }

      // Send email to renter about damage report
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: renterProfile.email,
          subject: `Damage Reported: ${booking.items.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ea580c;">⚠️ Damage Reported</h2>
              <p>Hi ${renterProfile.full_name},</p>
              <p>The owner has reported damage to the rented item.</p>
              
              <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${booking.items.title}</h3>
                <p><strong>Reported Damage:</strong> €${damageCost.toFixed(2)}</p>
                <p><strong>Reason:</strong><br>${damageDescription || 'Damage reported'}</p>
              </div>
              
              <p>Our platform fee includes insurance coverage for eligible claims. We’ll follow up if we need more information.</p>
              <p>The Rentilia Team</p>
            </div>
          `,
        }),
      });

      return new Response(
        JSON.stringify({ success: true, status: 'deposit_captured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      const { error: statusError } = await supabase
        .from('bookings')
        .update({
          status: 'closed_no_damage',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (statusError) {
        throw statusError;
      }

      // Send email to renter about return confirmation
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: renterProfile.email,
          subject: `Return Confirmed: ${booking.items.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">✅ Return Confirmed!</h2>
              <p>Hi ${renterProfile.full_name},</p>
              <p>Great news! The owner has confirmed the return of your rental.</p>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${booking.items.title}</h3>
                <p style="color: #16a34a; font-weight: bold;">Status: Closed</p>
              </div>
              
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
