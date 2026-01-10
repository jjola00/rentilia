import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

// Supabase automatically provides these environment variables
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

    const { bookingId } = await req.json();

    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, items(*)')
      .eq('id', bookingId)
      .eq('renter_id', user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'requested') {
      throw new Error('Booking is not in requested status');
    }

    if (booking.expires_at && new Date(booking.expires_at) < new Date()) {
      throw new Error('This booking request has expired. Please create a new booking.');
    }

    // Check if customer already exists for this user
    let customerId: string | undefined;
    
    const existingCustomers = await stripe.customers.list({
      email: user.email || undefined,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    // Prevent double-charging rental fee if it is already paid
    if (booking.payment_intent_id) {
      const existingRental = await stripe.paymentIntents.retrieve(booking.payment_intent_id);
      if (['succeeded', 'processing', 'requires_capture'].includes(existingRental.status)) {
        throw new Error('Rental payment already processed. Please contact support for help.');
      }
    }

    // Validate rental window against item rules
    if (!booking.start_datetime || !booking.end_datetime) {
      throw new Error('Booking dates are required');
    }

    const startDate = new Date(booking.start_datetime);
    const endDate = new Date(booking.end_datetime);
    const rentalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (booking.items?.min_rental_days && rentalDays < booking.items.min_rental_days) {
      throw new Error(`Minimum rental period is ${booking.items.min_rental_days} days`);
    }

    // Ensure no overlapping bookings for this item
    const { data: overlappingBookings, error: overlapError } = await supabase
      .from('bookings')
      .select('id, status, start_datetime, end_datetime')
      .eq('item_id', booking.item_id)
      .in('status', ['paid', 'picked_up', 'returned_waiting_owner'])
      .not('id', 'eq', bookingId)
      .lte('start_datetime', endDate.toISOString())
      .gte('end_datetime', startDate.toISOString());

    if (overlapError) {
      throw new Error('Unable to verify booking availability');
    }

    const nowIso = new Date().toISOString();
    const { data: requestedHolds, error: requestedError } = await supabase
      .from('bookings')
      .select('id, status, start_datetime, end_datetime')
      .eq('item_id', booking.item_id)
      .eq('status', 'requested')
      .gte('expires_at', nowIso)
      .not('id', 'eq', bookingId)
      .lte('start_datetime', endDate.toISOString())
      .gte('end_datetime', startDate.toISOString());

    if (requestedError) {
      throw new Error('Unable to verify booking availability');
    }

    if ((overlappingBookings && overlappingBookings.length > 0) || (requestedHolds && requestedHolds.length > 0)) {
      throw new Error('This item is already booked for the selected dates');
    }

    // If item requires license, verify renter has a valid one
    if (booking.items?.is_license_required) {
      const { data: licenseData, error: licenseError } = await supabase
        .from('licenses')
        .select('id, is_verified, expiry_date')
        .eq('user_id', user.id)
        .eq('is_verified', true)
        .gte('expiry_date', new Date().toISOString())
        .limit(1);

      if (licenseError) {
        throw new Error('Unable to verify license');
      }

      if (!licenseData || licenseData.length === 0) {
        throw new Error('A verified license is required to book this item');
      }
    }

    // If payment intents already exist and are valid, return them
    if (booking.payment_intent_id) {
      try {
        const existingRental = await stripe.paymentIntents.retrieve(booking.payment_intent_id);
        
        // If the rental intent is still usable, return its secret
        if (existingRental.client_secret && !['succeeded', 'canceled'].includes(existingRental.status)) {
          return new Response(
            JSON.stringify({
              rentalClientSecret: existingRental.client_secret,
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      } catch (e) {
        // If retrieval fails, create new ones
        console.log('Existing payment intents not found, creating new ones');
      }
    }

    // Create Payment Intent for rental fee (immediate capture)
    const serviceFee = booking.service_fee ?? Math.round(booking.total_rental_fee * 0.1 * 100) / 100;
    const totalCharge = booking.total_rental_fee + serviceFee;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalCharge * 100), // Convert to cents
      currency: 'eur',
      customer: customerId,
      setup_future_usage: 'off_session',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: bookingId,
        type: 'rental_fee',
        renter_id: user.id,
        item_id: booking.item_id,
      },
    });

    // Update booking with payment intent IDs
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_intent_id: paymentIntent.id,
        service_fee: serviceFee,
      })
      .eq('id', bookingId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        rentalClientSecret: paymentIntent.client_secret,
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
