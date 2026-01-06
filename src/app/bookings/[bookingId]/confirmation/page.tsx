'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Calendar, MapPin, Package, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BookingDetails {
  id: string;
  start_datetime: string;
  end_datetime: string;
  total_rental_fee: number;
  service_fee: number;
  status: string;
  items: {
    title: string;
    photo_urls: string[];
    pickup_address: string;
  };
}

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadBooking();
  }, [params.bookingId, user]);

  const loadBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, items(title, photo_urls, pickup_address)')
        .eq('id', params.bookingId)
        .eq('renter_id', user?.id)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error loading booking:', error);
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

  if (!booking) {
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <p className="text-muted-foreground">
            Your payment was successful and your booking is confirmed
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {booking.items.photo_urls && booking.items.photo_urls.length > 0 && (
            <img
              src={booking.items.photo_urls[0]}
              alt={booking.items.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          <div>
            <h3 className="font-semibold text-lg mb-2">{booking.items.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(booking.start_datetime), 'MMM d, yyyy')} - {format(new Date(booking.end_datetime), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{booking.items.pickup_address}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rental Fee</span>
              <span className="font-medium">€{booking.total_rental_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Fee (10%)</span>
              <span className="font-medium">€{booking.service_fee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid</span>
              <span>€{(booking.total_rental_fee + booking.service_fee).toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 mb-1">What's Next?</p>
            <ul className="text-blue-800 space-y-1 list-disc list-inside">
              <li>The owner will confirm your booking</li>
              <li>You'll receive pickup instructions</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href="/dashboard/bookings">View My Bookings</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/browse">Browse More Items</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
