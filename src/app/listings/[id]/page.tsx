'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  MapPin,
  Calendar,
  Shield,
  Truck,
  DollarSign,
  User,
  ArrowLeft,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface ItemDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  replacement_value: number;
  deposit_amount: number;
  min_rental_days: number;
  max_rental_days: number;
  pickup_type: string;
  is_license_required: boolean;
  pickup_address: string;
  photo_urls: string[];
  is_available: boolean;
  owner_id: string;
  created_at: string;
}

interface OwnerProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [item, setItem] = useState<ItemDetails | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItemDetails();
  }, [params.id]);

  const loadItemDetails = async () => {
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', params.id)
        .single();

      if (itemError) throw itemError;

      setItem(itemData);

      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, city, state')
        .eq('id', itemData.owner_id)
        .single();

      if (ownerError) throw ownerError;

      setOwner(ownerData);
    } catch (error) {
      console.error('Error loading item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load item details',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestBooking = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    router.push(`/bookings/new?itemId=${params.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item || !owner) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-semibold mb-2">Item not found</h3>
            <p className="text-muted-foreground mb-4">
              This item may have been removed or is no longer available
            </p>
            <Button asChild>
              <Link href="/browse">Browse Items</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === item.owner_id;
  const ownerInitial = owner.full_name.charAt(0).toUpperCase();

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Photos and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Carousel */}
          <Card className="overflow-hidden">
            {item.photo_urls && item.photo_urls.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {item.photo_urls.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video relative">
                        <img
                          src={url}
                          alt={`${item.title} - Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {item.photo_urls.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No photos available</p>
              </div>
            )}
          </Card>

          {/* Item Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold">{item.title}</h1>
                  {!item.is_available && (
                    <Badge variant="destructive">Unavailable</Badge>
                  )}
                </div>
                <Badge variant="secondary">{item.category}</Badge>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Rental Period</p>
                    <p className="text-sm text-muted-foreground">
                      {item.min_rental_days} - {item.max_rental_days} days
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Pickup</p>
                    <p className="text-sm text-muted-foreground">
                      {item.pickup_type === 'renter_pickup' ? 'Renter Pickup' : 'Owner Delivery'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {owner.city && owner.state ? `${owner.city}, ${owner.state}` : 'Location not specified'}
                    </p>
                  </div>
                </div>

                {item.is_license_required && (
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">License Required</p>
                      <p className="text-sm text-muted-foreground">
                        Valid certification needed
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Owner Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Owner</h2>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={owner.avatar_url || undefined} alt={owner.full_name} />
                  <AvatarFallback>{ownerInitial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{owner.full_name}</p>
                  {owner.city && owner.state && (
                    <p className="text-sm text-muted-foreground">
                      {owner.city}, {owner.state}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing and Booking */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-3xl font-bold text-primary">
                  ${item.price_per_day}
                  <span className="text-lg font-normal text-muted-foreground">/day</span>
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span className="font-medium">${item.deposit_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Replacement Value</span>
                  <span className="font-medium">${item.replacement_value}</span>
                </div>
              </div>

              <Separator />

              {isOwner ? (
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href={`/listings/${item.id}/edit`}>Edit Listing</Link>
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    This is your listing
                  </p>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleRequestBooking}
                  disabled={!item.is_available}
                >
                  {item.is_available ? 'Request Booking' : 'Currently Unavailable'}
                </Button>
              )}

              <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Secure payment processing
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Deposit refunded after return
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
