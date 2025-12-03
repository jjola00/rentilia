'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants/categories';
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
interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  photo_urls: string[];
  is_available: boolean;
  owner_id: string;
  created_at: string;
}
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';

function BrowsePageContent() {
  const searchParams = useSearchParams();

  const { user } = require('@/lib/auth/AuthProvider').useAuth();
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('q') || '');
  const [category, setCategory] = React.useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = React.useState([Number(searchParams.get('price')) || 499]);
  const [city, setCity] = React.useState(searchParams.get('city') || '');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from) {
        return { from: parseISO(from), to: to ? parseISO(to) : undefined };
    }
    return undefined;
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  React.useEffect(() => {
    loadItems();
  }, [category, priceRange, searchTerm, city]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();


      let query = supabase
        .from('items')
        .select(`*, profiles(city)`)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      // Exclude user's own listings
      if (user) {
        query = query.neq('owner_id', user.id);
      }

      // Apply category filter
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Apply price filter (only if less than max and greater than 0)
      if (priceRange && priceRange[0] > 0 && priceRange[0] < 499) {
        query = query.lte('price_per_day', priceRange[0]);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      // Filter by location on client side (since we need to join with profiles)
      let filteredData = data || [];
      if (city) {
        filteredData = filteredData.filter((item: any) => 
          item.profiles?.city?.toLowerCase().includes(city.toLowerCase())
        );
      }

      setItems(filteredData);
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items;


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
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Daily Rate: {priceRange[0] >= 499 ? '€500+' : `€${priceRange[0]}`}</Label>
                <Slider
                  value={priceRange}
                  min={1}
                  max={499}
                  step={10}
                  onValueChange={setPriceRange}
                />
                <p className="text-xs text-muted-foreground">Set to max (€500+) to see all items</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <input
                  id="city"
                  type="text"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredItems.length > 0 ? (
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
