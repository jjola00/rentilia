'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { CATEGORIES } from '@/lib/constants/categories';
import {
  ITEM_CONDITION_LABELS,
  ITEM_CONDITION_OPTIONS,
  type ItemCondition,
} from '@/lib/constants/item-conditions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  MapPin,
  Calendar,
  Shield,
  Truck,
  Coins,
  ArrowLeft,
  Edit,
  Save,
  X,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Rating from '@/components/shared/rating';
import { PhotoUpload } from '@/components/items/PhotoUpload';

interface ItemDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: ItemCondition;
  price_per_day: number;
  min_rental_days: number;
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
}

interface ItemReview {
  id: string;
  item_rating: number;
  user_rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [item, setItem] = useState<ItemDetails | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [itemReviews, setItemReviews] = useState<ItemReview[]>([]);
  const [itemRating, setItemRating] = useState<number | null>(null);
  const [ownerRating, setOwnerRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ItemDetails>>({});
  const [editPhotos, setEditPhotos] = useState<string[]>([]);

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
        .from('profiles_public')
        .select('id, full_name, avatar_url, city')
        .eq('id', itemData.owner_id)
        .single();

      if (ownerError) throw ownerError;

      setOwner(ownerData);

      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('id,item_rating,user_rating,comment,created_at,reviewer_id')
        .eq('item_id', itemData.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (reviewError) throw reviewError;

      const reviews = (reviewData || []) as ItemReview[];
      const reviewerIds = Array.from(new Set(reviews.map((review) => review.reviewer_id)));

      if (reviewerIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles_public')
          .select('id,full_name,avatar_url')
          .in('id', reviewerIds);

        if (profileError) throw profileError;

        const profileMap = (profileRows || []).reduce<Record<string, ItemReview['profiles']>>(
          (acc, profile) => {
            acc[profile.id] = {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
            };
            return acc;
          },
          {}
        );

        setItemReviews(
          reviews.map((review) => ({
            ...review,
            profiles: profileMap[review.reviewer_id] || null,
          }))
        );
      } else {
        setItemReviews(reviews);
      }

      if (reviews.length > 0) {
        const avg = reviews.reduce((sum, review) => sum + review.item_rating, 0) / reviews.length;
        setItemRating(avg);
      } else {
        setItemRating(null);
      }

      const { data: ownerReviewData, error: ownerReviewError } = await supabase
        .from('reviews')
        .select('user_rating')
        .eq('reviewee_id', itemData.owner_id)
        .eq('is_published', true);

      if (ownerReviewError) throw ownerReviewError;

      if (ownerReviewData && ownerReviewData.length > 0) {
        const avgOwner = ownerReviewData.reduce((sum, review) => sum + review.user_rating, 0) / ownerReviewData.length;
        setOwnerRating(avgOwner);
      } else {
        setOwnerRating(null);
      }
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

  const handleMessageOwner = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    router.push(`/messages?userId=${item?.owner_id}`);
  };

  const startEditing = () => {
    if (item) {
      setEditForm({
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        price_per_day: item.price_per_day,
        min_rental_days: item.min_rental_days,
        pickup_address: item.pickup_address,
      });
      setEditPhotos(item.photo_urls || []);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
    setEditPhotos([]);
  };

  const saveChanges = async () => {
    if (!item) return;

    setSaving(true);
    try {
      if (editPhotos.length < 4) {
        setSaving(false);
        toast({
          variant: 'destructive',
          title: 'Photos required',
          description: 'Please keep at least 4 photos for your listing.',
        });
        return;
      }

      const updatePayload = { ...editForm, photo_urls: editPhotos };
      const { error } = await supabase
        .from('items')
        .update(updatePayload)
        .eq('id', item.id);

      if (error) throw error;

      setItem({ ...item, ...updatePayload } as ItemDetails);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Listing updated successfully',
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update listing',
      });
    } finally {
      setSaving(false);
    }
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
              {isEditing ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={editForm.category || ''}
                        onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={editForm.condition || ''}
                        onValueChange={(value) => setEditForm({ ...editForm, condition: value as ItemCondition })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {ITEM_CONDITION_OPTIONS.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              {condition.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={5}
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Listing Photos</Label>
                      <PhotoUpload
                        photoUrls={editPhotos}
                        onPhotosChange={setEditPhotos}
                        maxPhotos={10}
                      />
                      <p className="text-sm text-muted-foreground">
                        Photos uploaded: {editPhotos.length}/4
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="min_rental_days">Minimum Rental Days</Label>
                      <Input
                        id="min_rental_days"
                        type="number"
                        value={editForm.min_rental_days || ''}
                        onChange={(e) => setEditForm({ ...editForm, min_rental_days: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickup_address">Pickup Address</Label>
                      <Textarea
                        id="pickup_address"
                        rows={2}
                        value={editForm.pickup_address || ''}
                        onChange={(e) => setEditForm({ ...editForm, pickup_address: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={saveChanges} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-3xl font-bold">{item.title}</h1>
                      {!item.is_available && (
                        <Badge variant="destructive">Unavailable</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      {item.condition && (
                        <Badge variant="outline">{ITEM_CONDITION_LABELS[item.condition]}</Badge>
                      )}
                    </div>
                    {itemRating !== null && (
                      <div className="mt-3">
                        <Rating rating={itemRating} reviewCount={itemReviews.length} />
                      </div>
                    )}
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
                        Minimum rental: {item.min_rental_days} days
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
                          {item.pickup_address || 'Location not specified'}
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Owner Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Owner</h2>
              <Link href={`/users/${owner.id}`} className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={owner.avatar_url || undefined} alt={owner.full_name} />
                  <AvatarFallback>{ownerInitial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{owner.full_name}</p>
                  {owner.city && (
                    <p className="text-sm text-muted-foreground">
                      {owner.city}
                    </p>
                  )}
                  {ownerRating !== null && (
                    <div className="mt-2">
                      <Rating rating={ownerRating} />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">View profile</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Reviews</h2>
                {itemReviews.length > 0 && itemRating !== null && (
                  <Rating rating={itemRating} reviewCount={itemReviews.length} size="sm" />
                )}
              </div>
              {itemReviews.length > 0 ? (
                <div className="space-y-4">
                  {itemReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {(review.profiles?.full_name || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">
                            {review.profiles?.full_name || 'User'}
                          </p>
                          <Rating rating={review.item_rating} size="sm" />
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing and Booking */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="price_per_day">Price per Day (€)</Label>
                      <Input
                        id="price_per_day"
                        type="number"
                        value={editForm.price_per_day || ''}
                        onChange={(e) => setEditForm({ ...editForm, price_per_day: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      €{item.price_per_day}
                      <span className="text-lg font-normal text-muted-foreground">/day</span>
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                  </div>

                  <Separator />

                  {isOwner ? (
                    <div className="space-y-2">
                      <Button className="w-full" onClick={startEditing}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Listing
                      </Button>
                      <p className="text-sm text-center text-muted-foreground">
                        This is your listing
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleRequestBooking}
                        disabled={!item.is_available}
                      >
                        {item.is_available ? 'Request Booking' : 'Currently Unavailable'}
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleMessageOwner}
                      >
                        Message Owner
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Secure payment processing
                    </p>
                    <p className="flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Platform fee includes insurance coverage
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
