'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react';
import { format } from 'date-fns';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingDetails {
  id: string;
  item_id: string;
  start_datetime: string;
  end_datetime: string;
  total_rental_fee: number;
  deposit_amount: number;
  status: string;
  items: {
    title: string;
    photo_urls: string[];
  };
}

function CheckoutForm({
  booking,
  clientSecrets,
  userEmail,
}: {
  booking: BookingDetails;
  clientSecrets: { rental: string; deposit: string };
  userEmail?: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm rental fee payment first (immediate capture)
       const rentalResult = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings/${booking.id}/confirmation`,
          // Billing email is optional; customer is created server-side
          payment_method_data: userEmail
            ? {
                billing_details: {
                  email: userEmail,
                },
              }
            : undefined,
        },
        redirect: 'if_required',
      });

      if (rentalResult.error) {
        // Common retryable errors are surfaced here
        throw new Error(rentalResult.error.message || 'Unable to process rental payment');
      }

      const rentalIntent = rentalResult.paymentIntent;
      if (!rentalIntent || (rentalIntent.status !== 'succeeded' && rentalIntent.status !== 'processing')) {
        throw new Error('Rental payment did not complete. Please try again.');
      }

      const rentalPaymentMethodId = rentalIntent.payment_method as string | null;
      if (!rentalPaymentMethodId) {
        throw new Error('Payment method was not attached. Please try again.');
      }

      // Confirm deposit authorization using the same payment method
      const depositResult = await stripe.confirmCardPayment(clientSecrets.deposit, {
        payment_method: rentalPaymentMethodId,
      });

      if (depositResult.error) {
        throw new Error(depositResult.error.message || 'Deposit authorization failed. Please try another card.');
      }

      const depositIntent = depositResult.paymentIntent;
      // For manual capture deposits, a successful hold will be `requires_capture`
      const depositOk = depositIntent && (depositIntent.status === 'requires_capture' || depositIntent.status === 'succeeded' || depositIntent.status === 'processing');
      if (!depositOk) {
        throw new Error('Deposit authorization did not complete. Please retry.');
      }

      // Update booking status only after both rental and deposit are confirmed
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'paid' })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      toast({
        title: 'Payment successful!',
        description: 'Your booking has been confirmed',
      });

      router.push(`/bookings/${booking.id}/confirmation`);
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMsg = error.message || 'Payment failed. Please try again.';
      setErrorMessage(errorMsg);
      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description: errorMsg,
      });
      // Don't redirect - let user retry
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>Enter your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay €${(booking.total_rental_fee + booking.deposit_amount).toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [clientSecrets, setClientSecrets] = useState<{ rental: string; deposit: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadBookingAndCreatePayment();
  }, [params.bookingId, user]);

  const loadBookingAndCreatePayment = async () => {
    try {
      // Load booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*, items(title, photo_urls)')
        .eq('id', params.bookingId)
        .eq('renter_id', user?.id)
        .single();

      if (bookingError) throw bookingError;

      if (bookingData.status !== 'requested') {
        toast({
          variant: 'destructive',
          title: 'Invalid booking',
          description: 'This booking has already been processed',
        });
        router.push('/dashboard');
        return;
      }

      setBooking(bookingData);

      // Create payment intents
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-booking-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ bookingId: params.bookingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment');
      }

      const { rentalClientSecret, depositClientSecret } = await response.json();

      setClientSecrets({
        rental: rentalClientSecret,
        deposit: depositClientSecret,
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load checkout',
      });
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking || !clientSecrets) {
    return null;
  }

  const options = {
    clientSecret: clientSecrets.rental,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Payment Form */}
        <div className="lg:col-span-2">
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm booking={booking} clientSecrets={clientSecrets} userEmail={user?.email} />
          </Elements>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.items.photo_urls && booking.items.photo_urls.length > 0 && (
                <img
                  src={booking.items.photo_urls[0]}
                  alt={booking.items.title}
                  className="w-full h-32 object-cover rounded"
                />
              )}

              <div>
                <h3 className="font-semibold">{booking.items.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.start_datetime), 'MMM d')} - {format(new Date(booking.end_datetime), 'MMM d, yyyy')}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Fee</span>
                  <span className="font-medium">€{booking.total_rental_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span className="font-medium">€{booking.deposit_amount.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>€{(booking.total_rental_fee + booking.deposit_amount).toFixed(2)}</span>
              </div>

              <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Deposit refunded after return
                </p>
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Secure payment processing
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
