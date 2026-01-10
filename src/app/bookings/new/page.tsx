'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { differenceInDays, format, startOfDay } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ItemDetails {
  id: string;
  title: string;
  price_per_day: number;
  min_rental_days: number;
  is_license_required: boolean;
  photo_urls: string[];
  owner_id: string;
  service_fee?: number;
}

function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const itemId = searchParams.get('itemId');

  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [hasValidLicense, setHasValidLicense] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!itemId) {
      router.push('/browse');
      return;
    }

    loadItemDetails();
  }, [itemId, user]);

  useEffect(() => {
    if (item?.is_license_required && user) {
      checkLicense();
    }
  }, [item, user]);

  const loadItemDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      if (data.owner_id === user?.id) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'You cannot book your own item',
        });
        router.push(`/listings/${itemId}`);
        return;
      }

      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load item details',
      });
      router.push('/browse');
    } finally {
      setLoading(false);
    }
  };

  const checkLicense = async () => {
    if (!user) return;

    setCheckingLicense(true);
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_verified', true)
        .gte('expiry_date', new Date().toISOString())
        .limit(1);

      if (error) throw error;

      setHasValidLicense(data && data.length > 0);
    } catch (error) {
      console.error('Error checking license:', error);
      setHasValidLicense(false);
    } finally {
      setCheckingLicense(false);
    }
  };

  const calculateRentalDays = () => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };

  const calculateTotalCost = () => {
    if (!item) return { rentalFee: 0, serviceFee: 0, total: 0 };

    const days = calculateRentalDays();
    const rentalFee = days * item.price_per_day;
    const serviceFee = Math.round(rentalFee * 0.1 * 100) / 100;

    return { rentalFee, serviceFee, total: rentalFee + serviceFee };
  };

  const validateDuration = () => {
    if (!item || !startDate || !endDate) return null;

    const days = calculateRentalDays();

    if (days < item.min_rental_days) {
      return `Minimum rental period is ${item.min_rental_days} days`;
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!user || !item || !startDate || !endDate) return;

    const durationError = validateDuration();
    if (durationError) {
      toast({
        variant: 'destructive',
        title: 'Invalid rental duration',
        description: durationError,
      });
      return;
    }

    if (item.is_license_required && !hasValidLicense) {
      toast({
        variant: 'destructive',
        title: 'License required',
        description: 'You need a valid verified license to book this item',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { rentalFee, serviceFee } = calculateTotalCost();

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          item_id: item.id,
          renter_id: user.id,
          start_datetime: startDate.toISOString(),
          end_datetime: endDate.toISOString(),
          total_rental_fee: rentalFee,
          service_fee: serviceFee,
          status: 'requested',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Booking requested!',
        description: 'Proceed to payment to confirm your booking',
      });

      router.push(`/checkout/${booking.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  const rentalDays = calculateRentalDays();
  const { rentalFee, serviceFee, total } = calculateTotalCost();
  const durationError = validateDuration();
  const canProceed = startDate && endDate && !durationError && (!item.is_license_required || hasValidLicense);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Request Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Item Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {item.photo_urls && item.photo_urls.length > 0 && (
                  <img
                    src={item.photo_urls[0]}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground">
                    €{item.price_per_day}/day
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum rental: {item.min_rental_days} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {item.is_license_required && (
            <Alert variant={hasValidLicense ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {checkingLicense ? (
                  'Checking license status...'
                ) : hasValidLicense ? (
                  'Valid license verified ✓'
                ) : (
                  'This item requires a valid verified license. Please upload and verify your license before booking.'
                )}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Select Dates</CardTitle>
              <CardDescription>Choose your rental period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => startOfDay(date) < startOfDay(new Date())}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || date < startDate}
                    className="rounded-md border"
                  />
                </div>
              </div>

              {durationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{durationError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {startDate && endDate ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dates</span>
                      <span className="font-medium">
                        {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{rentalDays} days</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        €{item.price_per_day} × {rentalDays} days
                      </span>
                      <span className="font-medium">€{rentalFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee (10%)</span>
                      <span className="font-medium">€{serviceFee.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Booking requests expire after 15 minutes if unpaid.
                  </p>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!canProceed || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select dates to see pricing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <BookingFormContent />
    </Suspense>
  );
}
