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
import { items } from '@/lib/placeholder-data';
import Image from 'next/image';
import { format } from 'date-fns';

export default function MyBookingsPage() {
  const bookings = [
    {
      item: items[1],
      startDate: new Date('2024-08-10'),
      endDate: new Date('2024-08-12'),
      status: 'upcoming',
      total: 165.0,
    },
    {
      item: items[3],
      startDate: new Date('2024-07-20'),
      endDate: new Date('2024-07-21'),
      status: 'active',
      total: 45.0,
    },
    {
      item: items[2],
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-05'),
      status: 'completed',
      total: 550.0,
    },
  ];

  const renderTable = (status: string) => (
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
        {bookings
          .filter((b) => b.status === status)
          .map((booking) => (
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
