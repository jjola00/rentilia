'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Item, Booking } from '@/lib/types';
import { CalendarX2 } from 'lucide-react';
import Link from 'next/link';

// This will be replaced with data fetched from Supabase
const bookings: Booking[] = [];

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

  const renderTable = (status: Booking['status']) => {
    const filteredBookings = bookings.filter((b) => b.status === status);
    
    if (filteredBookings.length === 0) {
      return <EmptyState />;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBookings.map((booking) => (
            <TableRow key={booking.item.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={booking.item.imageUrls[0]}
                      alt={booking.item.title}
                      fill
                      className="object-cover"
                      data-ai-hint="rental item"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{booking.item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Owner: {booking.item.owner.name}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {format(booking.startDate, 'MMM d')} -{' '}
                {format(booking.endDate, 'MMM d, yyyy')}
              </TableCell>
              <TableCell>${booking.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className="capitalize">{booking.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
        <CardDescription>
          View and manage your rentals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="active">{renderTable('active')}</TabsContent>
          <TabsContent value="upcoming">{renderTable('upcoming')}</TabsContent>
          <TabsContent value="completed">{renderTable('completed')}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
