import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'stripe-signature, content-type',
      } 
    });
  }

  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for idempotency
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log('Event already processed:', event.id);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Log webhook event
    await supabase.from('webhook_events').insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    });

    console.log('Processing event:', event.type, event.id);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.booking_id;
        const paymentType = paymentIntent.metadata.type;

        if (!bookingId) {
          console.error('No booking_id in metadata');
          break;
        }

        console.log(`Payment succeeded for booking ${bookingId}, type: ${paymentType}`);

        // Only update status when the rental fee is paid
        if (paymentType === 'rental_fee') {
          // Get booking details with item and user info
          const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select(`
              *,
              items!inner (
                title,
                pickup_address,
                owner_id
              )
            `)
            .eq('id', bookingId)
            .single();

          if (bookingError) {
            console.error('Error fetching booking:', bookingError);
            throw bookingError;
          }

          // Get renter profile
          const { data: renterProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', booking.renter_id)
            .single();

          // Get owner profile
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', booking.items.owner_id)
            .single();

          if (bookingError) {
            console.error('Error fetching booking:', bookingError);
            throw bookingError;
          }

          // Update booking status to paid
          const { error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'paid',
              expires_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

          if (updateError) {
            console.error('Error updating booking:', updateError);
            throw updateError;
          }

          // Send confirmation emails
          const startDate = new Date(booking.start_datetime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const endDate = new Date(booking.end_datetime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          // Email to renter
          if (renterProfile) {
            await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                to: renterProfile.email,
                subject: `Booking Confirmed: ${booking.items.title}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">🎉 Your Booking is Confirmed!</h2>
                    <p>Hi ${renterProfile.full_name},</p>
                    <p>Great news! Your booking has been confirmed and payment processed successfully.</p>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0;">${booking.items.title}</h3>
                      <p><strong>Rental Period:</strong><br>${startDate} - ${endDate}</p>
                      <p><strong>Pickup Location:</strong><br>${booking.items.pickup_address}</p>
                      <p><strong>Rental Fee:</strong> €${booking.total_rental_fee.toFixed(2)}</p>
                      <p><strong>Service Fee (10%):</strong> €${(booking.service_fee || 0).toFixed(2)}</p>
                      <p><strong>Total Paid:</strong> €${(booking.total_rental_fee + (booking.service_fee || 0)).toFixed(2)}</p>
                    </div>
                    
                    <h3>What's Next?</h3>
                    <ul>
                      <li>Coordinate pickup with the owner</li>
                    </ul>
                    
                    <p>Happy renting!<br>The Rentilia Team</p>
                  </div>
                `,
              }),
            });
          }

          // Email to owner
          if (ownerProfile) {
            await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                to: ownerProfile.email,
                subject: `New Booking: ${booking.items.title}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">📦 New Booking Received!</h2>
                    <p>Hi ${ownerProfile.full_name},</p>
                    <p>You have a new confirmed booking for your item.</p>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0;">${booking.items.title}</h3>
                      <p><strong>Renter:</strong> ${renterProfile?.full_name || 'Unknown'}</p>
                      <p><strong>Rental Period:</strong><br>${startDate} - ${endDate}</p>
                      <p><strong>Rental Fee:</strong> €${booking.total_rental_fee.toFixed(2)}</p>
                    </div>
                    
                    <p>Please coordinate with the renter for pickup arrangements.</p>
                    <p>Best regards,<br>The Rentilia Team</p>
                  </div>
                `,
              }),
            });
          }

          console.log('Booking updated to paid status and emails sent');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.booking_id;

        if (!bookingId) {
          console.error('No booking_id in metadata');
          break;
        }

        console.log(`Payment failed for booking ${bookingId}`);

        // Get booking and renter details
        const { data: booking } = await supabase
          .from('bookings')
          .select(`
            *,
            items!inner (title)
          `)
          .eq('id', bookingId)
          .single();

        let renterProfile = null;
        if (booking) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', booking.renter_id)
            .single();
          renterProfile = data;
        }

        // Log the failure
        await supabase.from('payment_failures').insert({
          booking_id: bookingId,
          payment_intent_id: paymentIntent.id,
          error_message: paymentIntent.last_payment_error?.message || 'Unknown error',
          failed_at: new Date().toISOString(),
        });

        // Send failure notification email to renter
        if (booking && renterProfile) {
          await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              to: renterProfile.email,
              subject: `Payment Failed: ${booking.items.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #dc2626;">❌ Payment Failed</h2>
                  <p>Hi ${renterProfile.full_name},</p>
                  <p>Unfortunately, your payment for <strong>${booking.items.title}</strong> could not be processed.</p>
                  
                  <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Error:</strong> ${paymentIntent.last_payment_error?.message || 'Unknown error'}</p>
                  </div>
                  
                  <p>Please try again with a different payment method or contact your bank if the issue persists.</p>
                  <p>The Rentilia Team</p>
                </div>
              `,
            }),
          });
        }

        console.log('Payment failure logged and email sent');
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);
        // Handle refund logic if needed
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
