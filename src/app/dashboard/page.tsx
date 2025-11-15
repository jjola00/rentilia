'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Box, CalendarCheck, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const stats = [
    { title: 'Total Earnings', value: '$0', icon: DollarSign },
    { title: 'Active Listings', value: '0', icon: Box },
    { title: 'Active Bookings', value: '0', icon: CalendarCheck },
    { title: 'Total Renters', value: '0', icon: Users },
  ];

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back, {userName}! 👋</CardTitle>
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

      {/* Recent Activity - Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your rental activity will appear here once you start listing or booking items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
        </CardContent>
      </Card>
    </div>
  );
}
