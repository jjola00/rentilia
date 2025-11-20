'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import ItemCard from '@/components/shared/item-card';
import {
  CalendarIcon,
  SlidersHorizontal,
  PackageSearch,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { Item } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';

function BrowsePageContent() {
  const searchParams = useSearchParams();

  // Data fetching will be implemented here. For now, we use an empty array.
  const [filteredItems, setFilteredItems] = React.useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('q') || '');
  const [category, setCategory] = React.useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = React.useState([Number(searchParams.get('price')) || 500]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from) {
        return { from: parseISO(from), to: to ? parseISO(to) : undefined };
    }
    return undefined;
  });

  // This effect will be used for fetching data based on filters.
  // React.useEffect(() => {
  //   // Fetch data from Supabase based on searchTerm, category, priceRange, etc.
  // }, [searchTerm, category, priceRange, dateRange]);


  return (
    <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Tools & Equipment">Tools & Equipment</SelectItem>
                    <SelectItem value="Party & Events">Party & Events</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                    <SelectItem value="Vehicles">Vehicles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Daily Rate: ${priceRange[0]}</Label>
                <Slider
                  value={priceRange}
                  max={500}
                  step={10}
                  onValueChange={setPriceRange}
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Select dates</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="pickup" />
                  <Label htmlFor="pickup">Pickup Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="delivery" />
                  <Label htmlFor="delivery">Delivery Available</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-3">
            <div className="mb-6">
                <h2 className="text-3xl font-bold font-headline">
                    Search Results
                </h2>
                 <p className="text-muted-foreground">
                    {filteredItems.length} items found {searchTerm && `for "${searchTerm}"`}
                 </p>
            </div>
          
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
                <PackageSearch className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No items match your search</h3>
                <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or searching for something else.</p>
            </div>
          )}
        </main>
      </div>
  );
}


export default function BrowsePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BrowsePageContent />
        </Suspense>
    )
}
