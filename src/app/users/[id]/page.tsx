'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ItemCard from '@/components/shared/item-card';
import Rating from '@/components/shared/rating';
import { Loader2, MessageSquare, MapPin } from 'lucide-react';

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  created_at: string;
};

type Listing = {
  id: string;
  title: string;
  category: string;
  price_per_day: number;
  photo_urls: string[];
  is_available: boolean;
};

type UserReview = {
  id: string;
  user_rating: number;
  comment: string | null;
  created_at: string;
  reviewer_role: 'renter' | 'owner';
  reviewer_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, listingsRes, reviewsRes] = await Promise.all([
          supabase
            .from('profiles_public')
            .select('id,full_name,avatar_url,city,bio,created_at')
            .eq('id', userId)
            .single(),
          supabase
            .from('items')
            .select('id,title,category,price_per_day,photo_urls,is_available')
            .eq('owner_id', userId)
            .eq('is_available', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('reviews')
            .select('id,user_rating,comment,created_at,reviewer_role,reviewer_id')
            .eq('reviewee_id', userId)
            .eq('is_published', true)
            .order('created_at', { ascending: false }),
        ]);

        if (profileRes.error) throw profileRes.error;
        if (listingsRes.error) throw listingsRes.error;
        if (reviewsRes.error) throw reviewsRes.error;

        setProfile(profileRes.data);
        setListings((listingsRes.data || []) as Listing[]);
        const reviewRows = (reviewsRes.data || []) as UserReview[];
        const reviewerIds = Array.from(new Set(reviewRows.map((review) => review.reviewer_id)));

        if (reviewerIds.length > 0) {
          const { data: profileRows, error: profileError } = await supabase
            .from('profiles_public')
            .select('id,full_name,avatar_url')
            .in('id', reviewerIds);

          if (profileError) throw profileError;

          const profileMap = (profileRows || []).reduce<Record<string, UserReview['profiles']>>(
            (acc, profile) => {
              acc[profile.id] = {
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
              };
              return acc;
            },
            {}
          );

          setReviews(
            reviewRows.map((review) => ({
              ...review,
              profiles: profileMap[review.reviewer_id] || null,
            }))
          );
        } else {
          setReviews(reviewRows);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const { ownerReviews, renterReviews, ownerRating, renterRating } = useMemo(() => {
    const owner = reviews.filter((review) => review.reviewer_role === 'renter');
    const renter = reviews.filter((review) => review.reviewer_role === 'owner');

    const avgOwner = owner.length
      ? owner.reduce((sum, review) => sum + review.user_rating, 0) / owner.length
      : null;
    const avgRenter = renter.length
      ? renter.reduce((sum, review) => sum + review.user_rating, 0) / renter.length
      : null;

    return {
      ownerReviews: owner,
      renterReviews: renter,
      ownerRating: avgOwner,
      renterRating: avgRenter,
    };
  }, [reviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-semibold mb-2">Profile not found</h3>
            <p className="text-muted-foreground mb-4">
              This user may no longer be available.
            </p>
            <Button asChild>
              <Link href="/browse">Browse Items</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = profile.full_name || 'User';
  const isSelf = user?.id === profile.id;

  const ReviewList = ({ data }: { data: UserReview[] }) => (
    data.length > 0 ? (
      <div className="space-y-4">
        {data.map((review) => (
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
                <Rating rating={review.user_rating} size="sm" />
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">No reviews yet.</p>
    )
  );

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {profile.city && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {profile.city}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Member since {format(new Date(profile.created_at), 'MMM yyyy')}
              </p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {profile.bio && (
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-4">
              {ownerRating !== null && (
                <div>
                  <p className="text-xs text-muted-foreground">As Owner</p>
                  <Rating rating={ownerRating} reviewCount={ownerReviews.length} size="sm" />
                </div>
              )}
              {renterRating !== null && (
                <div>
                  <p className="text-xs text-muted-foreground">As Renter</p>
                  <Rating rating={renterRating} reviewCount={renterReviews.length} size="sm" />
                </div>
              )}
            </div>
          </div>
          {!isSelf && (
            <div className="flex items-start md:items-center">
              <Button asChild variant="outline">
                <Link href={`/messages?userId=${profile.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Listings</h2>
        </div>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No active listings yet.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="owner">
              <TabsList>
                <TabsTrigger value="owner">As Owner ({ownerReviews.length})</TabsTrigger>
                <TabsTrigger value="renter">As Renter ({renterReviews.length})</TabsTrigger>
              </TabsList>
              <Separator className="my-4" />
              <TabsContent value="owner">
                <ReviewList data={ownerReviews} />
              </TabsContent>
              <TabsContent value="renter">
                <ReviewList data={renterReviews} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
