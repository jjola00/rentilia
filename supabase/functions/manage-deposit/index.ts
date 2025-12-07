import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;

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

    const { action, bookingId, amount } = await req.json();

    if (!action || !bookingId) {
      throw new Error('Action and booking ID are required');
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, items(owner_id)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Verify user is owner or renter
    const isOwner = booking.items.owner_id === user.id;
    const isRenter = booking.renter_id === user.id;

    if (!isOwner && !isRenter) {
      throw new Error('Unauthorized to manage this deposit');
    }

    if (!booking.deposit_pi_id) {
      throw new Error('No deposit payment intent found');
    }

    let result;

    // Always fetch latest deposit PI to validate status before acting
    const depositIntent = await stripe.paymentIntents.retrieve(booking.deposit_pi_id);

    if (action === 'release') {
      // Only owner can release deposit
      if (!isOwner) {
        throw new Error('Only the owner can release the deposit');
      }

      // Can only cancel (release) a manual PI that is still capturable
      if (depositIntent.status !== 'requires_capture') {
        throw new Error(`Deposit is not on hold (status: ${depositIntent.status}). Nothing to release.`);
      }

      // Cancel the payment intent to release the hold
      result = await stripe.paymentIntents.cancel(booking.deposit_pi_id);

      // Update booking status
      await supabase
        .from('bookings')
        .update({ 
          status: 'closed_no_damage',
          refund_amount: booking.deposit_amount,
          return_confirmed_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

    } else if (action === 'capture') {
      // Only owner can capture deposit
      if (!isOwner) {
        throw new Error('Only the owner can capture the deposit');
      }

      if (!amount || amount <= 0) {
        throw new Error('Valid amount is required for capture');
      }

      // Guard: deposit must be authorized and capturable
      if (depositIntent.status !== 'requires_capture') {
        throw new Error(`Deposit is not ready to capture (status: ${depositIntent.status}). Ask renter to complete checkout.`);
      }

      if (!depositIntent.amount_capturable || depositIntent.amount_capturable <= 0) {
        throw new Error('Deposit hold is missing capturable amount.');
      }

      // Capture the specified amount (or full deposit)
      const captureAmount = Math.min(amount, booking.deposit_amount);
      result = await stripe.paymentIntents.capture(booking.deposit_pi_id, {
        amount_to_capture: Math.round(captureAmount * 100),
      });

      // Update booking status
      const refundAmount = booking.deposit_amount - captureAmount;
      await supabase
        .from('bookings')
        .update({ 
          status: 'deposit_captured',
          refund_amount: refundAmount,
        })
        .eq('id', bookingId);

    } else {
      throw new Error('Invalid action. Use "release" or "capture"');
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        result: result.status,
      }),
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
