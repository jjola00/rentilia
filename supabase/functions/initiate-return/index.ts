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
          title,
          owner_id
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Load profiles separately to avoid FK relationship issues
    const [{ data: ownerProfile, error: ownerErr }, { data: renterProfile, error: renterErr }] =
      await Promise.all([
        supabase.from('profiles').select('full_name,email').eq('id', booking.items.owner_id).single(),
        supabase.from('profiles').select('full_name').eq('id', booking.renter_id).single(),
      ]);

    if (ownerErr || !ownerProfile) {
      throw new Error('Owner profile not found');
    }
    if (renterErr || !renterProfile) {
      throw new Error('Renter profile not found');
    }

    // Verify user is the renter
    if (booking.renter_id !== user.id) {
      throw new Error('Only the renter can initiate return');
    }

    // Verify booking is in picked_up status
    if (booking.status !== 'picked_up') {
      throw new Error('Booking must be picked up before initiating return');
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'returned_waiting_owner',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      throw updateError;
    }

    // Send notification email to owner
    await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        to: ownerProfile.email,
        subject: `Return Pending Confirmation: ${booking.items.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🔄 Item Return Initiated</h2>
            <p>Hi ${ownerProfile.full_name},</p>
            <p>${renterProfile.full_name} has marked <strong>${booking.items.title}</strong> as returned.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Action Required:</strong> Please inspect the item and confirm the return in your dashboard.</p>
            </div>
            
            <p>The Rentilia Team</p>
          </div>
        `,
      }),
    });

    return new Response(
      JSON.stringify({ success: true, status: 'returned_waiting_owner' }),
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
