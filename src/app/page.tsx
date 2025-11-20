'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search,
  SlidersHorizontal,
  MapPin,
  PackageSearch,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { Item } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export default function Home() {
  const [priceRange, setPriceRange] = React.useState([500]);
  // Data fetching will be implemented here. For now, we use an empty array.
  const [featuredItems, setFeaturedItems] = React.useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const router = useRouter();

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set('q', searchTerm);
    if (location) queryParams.set('location', location);
    if (category !== 'all') queryParams.set('category', category);
    if (priceRange[0] < 500) queryParams.set('price', priceRange[0].toString());
    if (dateRange?.from) queryParams.set('from', dateRange.from.toISOString());
    if (dateRange?.to) queryParams.set('to', dateRange.to.toISOString());

    router.push(`/browse?${queryParams.toString()}`);
  };
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
  }


  return (
    <>
      <section className="relative w-full bg-primary/10 py-20 md:py-32 lg:py-40">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Rent Anything, Anywhere
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
            From power tools to party supplies, find what you need from people
            in your community.
          </p>
          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 sm:flex-row">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="What are you looking for?"
                className="h-12 pl-10 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Location (e.g., 'New York, NY')"
                className="h-12 pl-10 text-base"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSearch}>
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
        <aside className="hidden md:block md:col-span-1">
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
                  defaultValue={[500]}
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
              <Button onClick={handleSearch} className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-3">
          <h2 className="mb-6 text-3xl font-bold font-headline">
            Featured Items
          </h2>
          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
                <PackageSearch className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No items to display</h3>
                <p className="mt-2 text-sm text-muted-foreground">Check back later for featured items, or try a search.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
