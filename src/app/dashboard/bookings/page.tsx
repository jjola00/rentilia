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
  deposit_amount: number;
  status: string;
  items: {
    id: string;
    title: string;
    photo_urls: string[];
    owner_id: string;
  };
  renter_id: string;
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
        description: hasDamage ? 'Return confirmed with damage' : 'Return confirmed, deposit released',
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
    return <Badge className={variants[status] || ''}>{status.replace(/_/g, ' ')}</Badge>;
  };

  const renderBookingCard = (booking: BookingData, isOwner: boolean) => {
    const showPickupButton = isOwner && booking.status === 'paid';
    const showReturnButton = !isOwner && booking.status === 'picked_up';
    const showConfirmReturnButton = isOwner && booking.status === 'returned_waiting_owner';
    const counterparty = isOwner
      ? (booking.renter_id ? `Renter: ${booking.renter_id}` : 'Renter')
      : (booking.items?.owner_id ? `Owner: ${booking.items.owner_id}` : 'Owner');

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
                  <p className="text-xs text-muted-foreground">+€{booking.deposit_amount.toFixed(2)} deposit</p>
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
                {showReturnButton && (
                  <Button
                    size="sm"
                    onClick={() => handleInitiateReturn(booking.id)}
                    disabled={actionLoading === booking.id}
                  >
                    {actionLoading === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4 mr-1" />}
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
              </div>
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
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>
            View and manage your rentals.
          </CardDescription>
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
    </>
  );
}
