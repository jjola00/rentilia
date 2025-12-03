'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Box, CalendarCheck, Users, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useProfile } from '@/hooks/use-profile';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
function DashboardPage() {
  const { user } = useAuth();
  const { displayName } = useProfile();
  const [activeListings, setActiveListings] = useState(0);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const firstName = displayName.split(' ')[0] || displayName;

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    // Fetch active listings count
    const { data: listings, error } = await supabase
      .from('items')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && listings) {
      setActiveListings(listings.filter((item: any) => item.is_available).length);
      setRecentListings(listings.slice(0, 3));
    }
    setLoading(false);
  };

  const stats = [
    { title: 'Total Earnings', value: '$0', icon: DollarSign },
    { title: 'Active Listings', value: activeListings.toString(), icon: Box },
    { title: 'Active Bookings', value: '0', icon: CalendarCheck },
    { title: 'Total Renters', value: '0', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back, {firstName}! 👋</CardTitle>
          <CardDescription>
            Your rental marketplace dashboard. Start by listing your first item or browse available rentals.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href="/listings/new">
              <Plus className="mr-2 h-4 w-4" />
              List an Item
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/browse">Browse Items</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.title === 'Active Listings' && 'List items to start earning'}
                {stat.title === 'Active Bookings' && 'No active bookings yet'}
                {stat.title === 'Total Earnings' && 'Start renting to earn'}
                {stat.title === 'Total Renters' && 'Build your renter base'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your most recent listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[100px]">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Box className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Start by listing an item you want to rent out, or browse available items to book.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/listings/new">List an Item</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/browse">Browse Items</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentListings.map((item: any) => (
                <Card key={item.id} className="flex flex-row items-center gap-4 p-2">
                  <div className="w-20 h-16 bg-muted rounded overflow-hidden flex items-center justify-center">
                    {item.photo_urls && item.photo_urls.length > 0 ? (
                      <img src={item.photo_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Box className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.category}</div>
                  </div>
                  <div className="text-primary font-bold">€{item.price_per_day}</div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/listings/${item.id}`}>View</Link>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

export default DashboardPage;