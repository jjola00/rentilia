import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Box, CalendarCheck, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userJohn } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    { title: 'Total Earnings', value: '$4,250', icon: DollarSign },
    { title: 'Active Listings', value: '8', icon: Box },
    { title: 'Active Bookings', value: '3', icon: CalendarCheck },
    { title: 'Total Renters', value: '42', icon: Users },
  ];

  const recentActivity = [
    {
      user: userJohn,
      item: 'Professional DSLR Camera',
      status: 'booked',
      date: '2 hours ago',
    },
    {
      user: { name: 'Emily R.', avatarUrl: 'https://picsum.photos/seed/203/100/100' },
      item: 'Large Event Tent',
      status: 'returned',
      date: '1 day ago',
    },
     {
      user: { name: 'Mark L.', avatarUrl: 'https://picsum.photos/seed/205/100/100' },
      item: 'High-Powered Electric Drill',
      status: 'pending',
      date: '2 days ago',
    },
  ];

  return (
    <div className="space-y-6">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            An overview of your most recent rental activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Renter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{activity.item}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatarUrl} alt={activity.user.name} />
                        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{activity.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      activity.status === 'booked' ? 'default' :
                      activity.status === 'returned' ? 'secondary' : 'outline'
                    } className="capitalize">
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/bookings">View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
