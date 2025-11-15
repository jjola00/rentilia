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
import { items } from '@/lib/placeholder-data';
import {
  CalendarIcon,
  Search,
  SlidersHorizontal,
  MapPin,
} from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [priceRange, setPriceRange] = React.useState([50]);

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
              />
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Location (e.g., 'New York, NY')"
                className="h-12 pl-10 text-base"
              />
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90">
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>
        </div>
      </section>

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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tools">Tools & Equipment</SelectItem>
                    <SelectItem value="party">Party & Events</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="sports">Sports & Outdoors</SelectItem>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Daily Rate: ${priceRange[0]}</Label>
                <Slider
                  defaultValue={[50]}
                  max={500}
                  step={10}
                  onValueChange={setPriceRange}
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Select Dates
                </Button>
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
          <h2 className="mb-6 text-3xl font-bold font-headline">Featured Items</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
