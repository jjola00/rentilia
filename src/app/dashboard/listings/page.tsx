'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, PackagePlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import Rating from '@/components/shared/rating';
import type { Item } from '@/lib/types';
import React from 'react';

export default function MyListingsPage() {
  // Data fetching will be implemented here. For now, we use an empty array.
  const [userItems, setUserItems] = React.useState<Item[]>([]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Listings</CardTitle>
          <CardDescription>
            Manage your items and view their performance.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/listings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Listing
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {userItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={item.imageUrls[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                          data-ai-hint="rental item"
                        />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>Active</Badge>
                  </TableCell>
                  <TableCell>${item.dailyRate}</TableCell>
                  <TableCell>
                    <Rating
                      rating={item.rating}
                      reviewCount={item.reviewCount}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Pause</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
            <PackagePlus className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">You haven't listed any items yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              List your first item to start earning money.
            </p>
            <Button asChild className="mt-4">
              <Link href="/listings/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                List an Item
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
