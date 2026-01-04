'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarX2, Loader2, Package, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface BookingData {
  id: string;
  start_datetime: string;
  end_datetime: string;
  total_rental_fee: number;
  status: string;
  items: {
    id: string;
    title: string;
    photo_urls: string[];
    owner_id: string;
  };
  renter_id: string;
  booking_photos?: {
    id: string;
    photo_url: string;
    photo_type: 'pickup' | 'return';
    uploaded_by: string;
    created_at: string;
  }[];
  reviews?: {
    id: string;
    reviewer_id: string;
    reviewee_id: string;
    reviewer_role: 'renter' | 'owner';
    item_rating: number;
    user_rating: number;
    comment: string | null;
    is_published: boolean;
    created_at: string;
  }[];
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
      <CalendarX2 className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-xl font-semibold">No bookings here</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        When you book an item, it will show up here.
      </p>
      <Button asChild className="mt-4">
        <Link href="/browse">Browse Items</Link>
      </Button>
    </div>
  );
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [asRenterBookings, setAsRenterBookings] = useState<BookingData[]>([]);
  const [asOwnerBookings, setAsOwnerBookings] = useState<BookingData[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [damageDialogOpen, setDamageDialogOpen] = useState(false);
  const [damageTarget, setDamageTarget] = useState<BookingData | null>(null);
  const [damageAmount, setDamageAmount] = useState('');
  const [damageNotes, setDamageNotes] = useState('');
  const [damageFile, setDamageFile] = useState<File | null>(null);
  const [damageSubmitting, setDamageSubmitting] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<BookingData | null>(null);
  const [photoType, setPhotoType] = useState<'pickup' | 'return'>('pickup');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<BookingData | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [itemRating, setItemRating] = useState('5');
  const [userRating, setUserRating] = useState('5');
  const [reviewNotes, setReviewNotes] = useState('');
  const [statementStart, setStatementStart] = useState('');
  const [statementEnd, setStatementEnd] = useState('');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      // Get bookings where user is renter
      const { data: renterData, error: renterError } = await supabase
        .from('bookings')
        .select(`
          *,
          items (
            id,
            title,
            photo_urls,
            owner_id
          ),
          booking_photos (
            id,
            photo_url,
            photo_type,
            uploaded_by,
            created_at
          ),
          reviews (
            id,
            reviewer_id,
            reviewee_id,
            reviewer_role,
            item_rating,
            user_rating,
            comment,
            is_published,
            created_at
          )
        `)
        .eq('renter_id', user?.id)
        .order('created_at', { ascending: false });

      if (renterError) throw renterError;

      // Get bookings where user is owner
      const { data: ownerData, error: ownerError } = await supabase
        .from('bookings')
        .select(`
          *,
          items!inner (
            id,
            title,
            photo_urls,
            owner_id
          ),
          booking_photos (
            id,
            photo_url,
            photo_type,
            uploaded_by,
            created_at
          ),
          reviews (
            id,
            reviewer_id,
            reviewee_id,
            reviewer_role,
            item_rating,
            user_rating,
            comment,
            is_published,
            created_at
          )
        `)
        .eq('items.owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (ownerError) throw ownerError;

      setAsRenterBookings(renterData || []);
      setAsOwnerBookings(ownerData || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/confirm-pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: 'Success',
        description: 'Pickup confirmed',
      });
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleNoDamage = (bookingId: string) => {
    handleConfirmReturn({ bookingId, hasDamage: false });
  };

  const openDamageDialog = (booking: BookingData) => {
    setDamageTarget(booking);
    setDamageAmount('');
    setDamageNotes('');
    setDamageFile(null);
    setDamageDialogOpen(true);
  };

  const handleDamageSubmit = async () => {
    if (!damageTarget || !user) return;

    const parsedAmount = parseFloat(damageAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a valid damage amount.',
        variant: 'destructive',
      });
      return;
    }

    setDamageSubmitting(true);
    let evidenceUrl: string | null = null;

    try {
      if (damageFile) {
        try {
          const fileExt = damageFile.name.split('.').pop();
          // Storage RLS expects first folder to be user id for return-evidence bucket
          const filePath = `${user.id}/${damageTarget.id}-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('return-evidence')
            .upload(filePath, damageFile, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('return-evidence')
            .getPublicUrl(filePath);

          evidenceUrl = publicUrlData?.publicUrl || null;
        } catch (err) {
          console.error('Evidence upload failed:', err);
          toast({
            title: 'Evidence upload failed',
            description: 'Continuing without photo.',
            variant: 'destructive',
          });
        }
      }

      await handleConfirmReturn({
        bookingId: damageTarget.id,
        hasDamage: true,
        damageCost: parsedAmount,
        damageDescription: damageNotes || 'Damage reported',
        evidenceUrl,
      });

      setDamageDialogOpen(false);
    } finally {
      setDamageSubmitting(false);
    }
  };

  const openPhotoDialog = (booking: BookingData, type: 'pickup' | 'return') => {
    setPhotoTarget(booking);
    setPhotoType(type);
    setPhotoFile(null);
    setPhotoDialogOpen(true);
  };

  const uploadBookingPhoto = async (bookingId: string, type: 'pickup' | 'return', file: File) => {
    if (!user) throw new Error('User not authenticated');
    const fileExt = file.name.split('.').pop();
    const fileName = `${bookingId}-${type}-${Date.now()}.${fileExt}`;
    const filePath = `${bookingId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('booking-photos')
      .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('booking-photos')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from('booking_photos')
      .insert({
        booking_id: bookingId,
        uploaded_by: user.id,
        photo_url: data.publicUrl,
        photo_type: type,
      });

    if (insertError) throw insertError;
  };

  const handlePhotoSubmit = async () => {
    if (!photoTarget || !user) return;

    if (photoType === 'pickup' && !photoFile) {
      toast({
        title: 'Photo required',
        description: 'Select a pickup photo or cancel.',
        variant: 'destructive',
      });
      return;
    }

    setPhotoSubmitting(true);
    try {
      if (photoFile) {
        await uploadBookingPhoto(photoTarget.id, photoType, photoFile);
      }

      if (photoType === 'return') {
        await handleInitiateReturn(photoTarget.id);
      } else {
        toast({
          title: 'Photo uploaded',
          description: 'Pickup photo saved successfully.',
        });
        loadBookings();
      }

      setPhotoDialogOpen(false);
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Could not upload photo.',
        variant: 'destructive',
      });
    } finally {
      setPhotoSubmitting(false);
    }
  };

  const openReviewDialog = (booking: BookingData) => {
    setReviewTarget(booking);
    setItemRating('5');
    setUserRating('5');
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (!reviewTarget || !user) return;

    const parsedItemRating = Number(itemRating);
    const parsedUserRating = Number(userRating);
    if (!Number.isFinite(parsedItemRating) || !Number.isFinite(parsedUserRating)) {
      toast({
        title: 'Invalid rating',
        description: 'Please select valid ratings.',
        variant: 'destructive',
      });
      return;
    }

    setReviewSubmitting(true);
    try {
      const isOwner = reviewTarget.items.owner_id === user.id;
      const revieweeId = isOwner ? reviewTarget.renter_id : reviewTarget.items.owner_id;

      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: reviewTarget.id,
          reviewer_id: user.id,
          reviewee_id: revieweeId,
          item_id: reviewTarget.items.id,
          reviewer_role: isOwner ? 'owner' : 'renter',
          item_rating: parsedItemRating,
          user_rating: parsedUserRating,
          comment: reviewNotes.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Review submitted',
        description: 'Thanks for sharing your feedback.',
      });
      setReviewDialogOpen(false);
      loadBookings();
    } catch (error: any) {
      console.error('Review submit error:', error);
      toast({
        title: 'Review failed',
        description: error.message || 'Could not submit review.',
        variant: 'destructive',
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const downloadOwnerStatement = () => {
    if (!asOwnerBookings.length) {
      toast({
        title: 'No earnings yet',
        description: 'There are no bookings to include in the statement.',
      });
      return;
    }

    const start = statementStart || null;
    const end = statementEnd || null;

    const filtered = asOwnerBookings.filter((booking) => {
      const endDate = booking.end_datetime?.slice(0, 10);
      if (!endDate) return false;
      if (start && endDate < start) return false;
      if (end && endDate > end) return false;
      return true;
    });

    if (!filtered.length) {
      toast({
        title: 'No results',
        description: 'No bookings match that date range.',
        variant: 'destructive',
      });
      return;
    }

    const headers = [
      'booking_id',
      'item_title',
      'start_date',
      'end_date',
      'status',
      'rental_fee',
      'total_charged',
    ];

    const csvEscape = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const rows = filtered.map((booking) => {
      const rentalFee = booking.total_rental_fee ?? 0;
      return {
        booking_id: booking.id,
        item_title: booking.items?.title || 'Unknown',
        start_date: format(new Date(booking.start_datetime), 'yyyy-MM-dd'),
        end_date: format(new Date(booking.end_datetime), 'yyyy-MM-dd'),
        status: booking.status,
        rental_fee: rentalFee.toFixed(2),
        total_charged: rentalFee.toFixed(2),
      };
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((header) => csvEscape(String(row[header as keyof typeof row]))).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const labelStart = start || 'all';
    const labelEnd = end || 'all';
    link.href = url;
    link.download = `rentilia-earnings-${labelStart}-to-${labelEnd}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleInitiateReturn = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/initiate-return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: 'Success',
        description: 'Return initiated. Waiting for owner confirmation.',
      });
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReturn = async ({
    bookingId,
    hasDamage,
    damageCost,
    damageDescription,
    evidenceUrl,
  }: {
    bookingId: string;
    hasDamage: boolean;
    damageCost?: number | null;
    damageDescription?: string | null;
    evidenceUrl?: string | null;
  }) => {
    setActionLoading(bookingId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/confirm-return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ 
          bookingId,
          hasDamage,
          damageDescription: damageDescription ? `${damageDescription}${evidenceUrl ? `\nEvidence: ${evidenceUrl}` : ''}` : null,
          damageCost: hasDamage ? damageCost : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: 'Success',
        description: hasDamage ? 'Return confirmed with damage' : 'Return confirmed',
      });
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      requested: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      returned_waiting_owner: 'bg-orange-100 text-orange-800',
      closed_no_damage: 'bg-green-100 text-green-800',
      deposit_captured: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      deposit_captured: 'closed (damage reported)',
    };
    return (
      <Badge className={variants[status] || ''}>
        {(labels[status] || status).replace(/_/g, ' ')}
      </Badge>
    );
  };

  const renderBookingCard = (booking: BookingData, isOwner: boolean) => {
    const showPickupButton = isOwner && booking.status === 'paid';
    const showReturnButton = !isOwner && booking.status === 'picked_up';
    const showPickupPhotoButton = !isOwner && booking.status === 'picked_up';
    const showConfirmReturnButton = isOwner && booking.status === 'returned_waiting_owner';
    const canReview = booking.status === 'closed_no_damage' || booking.status === 'deposit_captured';
    const counterparty = isOwner
      ? (booking.renter_id ? `Renter: ${booking.renter_id}` : 'Renter')
      : (booking.items?.owner_id ? `Owner: ${booking.items.owner_id}` : 'Owner');
    const pickupPhotos = booking.booking_photos?.filter((photo) => photo.photo_type === 'pickup') || [];
    const returnPhotos = booking.booking_photos?.filter((photo) => photo.photo_type === 'return') || [];
    const myReview = booking.reviews?.find((review) => review.reviewer_id === user?.id) || null;
    const otherReview = booking.reviews?.find((review) => review.reviewer_id !== user?.id) || null;
    const reviewPending = myReview && !otherReview;

    return (
      <Card key={booking.id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {booking.items.photo_urls && booking.items.photo_urls.length > 0 && (
              <img
                src={booking.items.photo_urls[0]}
                alt={booking.items.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{booking.items.title}</h3>
                  <p className="text-sm text-muted-foreground">{counterparty}</p>
                  <p className="text-sm mt-1">
                    {format(new Date(booking.start_datetime), 'MMM d')} - {format(new Date(booking.end_datetime), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(booking.status)}
                  <p className="text-sm font-medium mt-2">€{booking.total_rental_fee.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                {showPickupButton && (
                  <Button
                    size="sm"
                    onClick={() => handleConfirmPickup(booking.id)}
                    disabled={actionLoading === booking.id}
                  >
                    {actionLoading === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Confirm Pickup
                  </Button>
                )}
                {showPickupPhotoButton && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPhotoDialog(booking, 'pickup')}
                    disabled={photoSubmitting}
                  >
                    Upload Pickup Photo
                  </Button>
                )}
                {showReturnButton && (
                  <Button
                    size="sm"
                    onClick={() => openPhotoDialog(booking, 'return')}
                    disabled={actionLoading === booking.id || photoSubmitting}
                  >
                    {actionLoading === booking.id || photoSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4 mr-1" />}
                    Mark as Returned
                  </Button>
                )}
                {showConfirmReturnButton && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleNoDamage(booking.id)}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'No Damage'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDamageDialog(booking)}
                      disabled={actionLoading === booking.id}
                    >
                      Report Damage
                    </Button>
                  </>
                )}
                {canReview && !myReview && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openReviewDialog(booking)}
                    disabled={reviewSubmitting}
                  >
                    Leave Review
                  </Button>
                )}
              </div>

              {myReview && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {reviewPending
                    ? 'Review submitted. The other person will see it after they review.'
                    : 'Both reviews submitted.'}
                </p>
              )}

              {(pickupPhotos.length > 0 || returnPhotos.length > 0) && (
                <div className="mt-4 space-y-3">
                  {pickupPhotos.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Pickup Photos</p>
                      <div className="flex gap-2 flex-wrap">
                        {pickupPhotos.map((photo) => (
                          <img
                            key={photo.id}
                            src={photo.photo_url}
                            alt="Pickup condition"
                            className="h-16 w-20 rounded-md object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {returnPhotos.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Return Photos</p>
                      <div className="flex gap-2 flex-wrap">
                        {returnPhotos.map((photo) => (
                          <img
                            key={photo.id}
                            src={photo.photo_url}
                            alt="Return condition"
                            className="h-16 w-20 rounded-md object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>
              View and manage your rentals.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="statement-start">From</Label>
              <Input
                id="statement-start"
                type="date"
                value={statementStart}
                onChange={(e) => setStatementStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="statement-end">To</Label>
              <Input
                id="statement-end"
                type="date"
                value={statementEnd}
                onChange={(e) => setStatementEnd(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={downloadOwnerStatement}>
              Download Earnings            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="renter">
            <TabsList>
              <TabsTrigger value="renter">As Renter ({asRenterBookings.length})</TabsTrigger>
              <TabsTrigger value="owner">As Owner ({asOwnerBookings.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="renter">
              {asRenterBookings.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-4">
                  {asRenterBookings.map((booking) => renderBookingCard(booking, false))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="owner">
              {asOwnerBookings.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-4">
                  {asOwnerBookings.map((booking) => renderBookingCard(booking, true))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={damageDialogOpen} onOpenChange={setDamageDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Damage</DialogTitle>
          <DialogDescription>
            Enter the damage amount and notes. Optionally attach a photo as evidence.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="damage-amount">Damage amount (€)</Label>
            <Input
              id="damage-amount"
              type="number"
              min="0"
              step="0.01"
              value={damageAmount}
              onChange={(e) => setDamageAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="damage-notes">Notes</Label>
            <Textarea
              id="damage-notes"
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              rows={3}
              placeholder="Describe the issue..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="damage-file">Photo evidence (optional)</Label>
            <Input
              id="damage-file"
              type="file"
              accept="image/*"
              onChange={(e) => setDamageFile(e.target.files?.[0] || null)}
            />
            {damageFile && <p className="text-xs text-muted-foreground">Selected: {damageFile.name}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDamageDialogOpen(false)} disabled={damageSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleDamageSubmit} disabled={damageSubmitting}>
            {damageSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{photoType === 'pickup' ? 'Upload Pickup Photo' : 'Return Photo (Optional)'}</DialogTitle>
            <DialogDescription>
              {photoType === 'pickup'
                ? 'Upload a photo of the item condition when you receive it.'
                : 'Upload a photo of the item when returning it.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="booking-photo">Photo</Label>
              <Input
                id="booking-photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              />
              {photoFile && <p className="text-xs text-muted-foreground">Selected: {photoFile.name}</p>}
              {photoType === 'return' && (
                <p className="text-xs text-muted-foreground">You can skip this and submit without a photo.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)} disabled={photoSubmitting}>
              Cancel
            </Button>
            <Button onClick={handlePhotoSubmit} disabled={photoSubmitting}>
              {photoSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {photoType === 'return' ? 'Submit Return' : 'Upload Photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Rate the item and the person you rented with.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Item Rating</Label>
              <Select value={itemRating} onValueChange={setItemRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} star{rating > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>User Rating</Label>
              <Select value={userRating} onValueChange={setUserRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} star{rating > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-notes">Notes</Label>
              <Textarea
                id="review-notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Share details about the rental..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} disabled={reviewSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit} disabled={reviewSubmitting}>
              {reviewSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
