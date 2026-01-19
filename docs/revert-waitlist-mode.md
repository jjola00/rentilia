# How to Revert Waitlist Mode

This document outlines the steps to disable the waitlist mode and restore the full application functionality for the beta launch.

## 1. Remove Middleware Redirect

The primary change to disable is the redirect logic in the middleware.

**File:** `src/middleware.ts`

**Action:** Replace the entire content of `src/middleware.ts` with the original code below. This will remove the logic that redirects all traffic to the `/waitlist` page.

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## 2. Restore Homepage

The homepage was replaced with content from the "About Us" page.

**File:** `src/app/page.tsx`

**Action:** Replace the content of `src/app/page.tsx` with its original code to restore the search hero and featured items sections.

```typescript
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
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants/categories';
import { createClient } from '@/lib/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

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
  is_top_pick?: boolean;
}

export default function Home() {
  const [priceRange, setPriceRange] = React.useState([499]);
  const [topPickItems, setTopPickItems] = React.useState<Item[]>([]);
  const [featuredItems, setFeaturedItems] = React.useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [pickupAvailable, setPickupAvailable] = React.useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = React.useState(false);

  const router = useRouter();

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set('q', searchTerm);
    if (location) queryParams.set('city', location);
    if (category !== 'all') queryParams.set('category', category);
    if (priceRange[0] < 500) queryParams.set('price', priceRange[0].toString());
    if (dateRange?.from) queryParams.set('from', dateRange.from.toISOString());
    if (dateRange?.to) queryParams.set('to', dateRange.to.toISOString());
    if (pickupAvailable) queryParams.set('pickup', 'true');
    if (deliveryAvailable) queryParams.set('delivery', 'true');

    router.push(`/browse?${queryParams.toString()}`);
  };
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
  }

  React.useEffect(() => {
    const loadFeatured = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      let topPickQuery = supabase
        .from('items')
        .select('*')
        .eq('is_available', true)
        .eq('is_top_pick', true)
        .order('created_at', { ascending: false })
        .limit(6);

      let featuredQuery = supabase
        .from('items')
        .select('*')
        .eq('is_available', true)
        .eq('is_top_pick', false)
        .order('created_at', { ascending: false })
        .limit(6);

      if (user) {
        topPickQuery = topPickQuery.neq('owner_id', user.id);
        featuredQuery = featuredQuery.neq('owner_id', user.id);
      }

      const [{ data: topPickData, error: topPickError }, { data: featuredData, error: featuredError }] =
        await Promise.all([topPickQuery, featuredQuery]);

      if (!topPickError && topPickData) {
        setTopPickItems(topPickData as Item[]);
      }

      if (!featuredError && featuredData) {
        setFeaturedItems(featuredData as Item[]);
      }
    };

    loadFeatured();
  }, []);


  return (
    <>
      <section className="relative w-full bg-primary/10 py-20 md:py-32 lg:py-40">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Rent Anything, Anywhere
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
            From film cameras to studio microphones, find the media gear you need from creators in your community.
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
                placeholder="Location (e.g., 'Dublin, IE')"
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
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Daily Rate: {priceRange[0] >= 499 ? '€500+' : `€${priceRange[0]}`}</Label>
                <Slider
                  defaultValue={[499]}
                  min={1}
                  max={499}
                  step={10}
                  onValueChange={setPriceRange}
                />
                <p className="text-xs text-muted-foreground">Set to max (€500+) to see all items</p>
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
                  <Checkbox id="pickup" checked={pickupAvailable} onCheckedChange={(checked) => setPickupAvailable(Boolean(checked))} />
                  <Label htmlFor="pickup">Pickup Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="delivery" checked={deliveryAvailable} onCheckedChange={(checked) => setDeliveryAvailable(Boolean(checked))} />
                  <Label htmlFor="delivery">Delivery Available</Label>
                </div>
              </div>
              <Button onClick={handleSearch} className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-3 space-y-10">
          {topPickItems.length > 0 && (
            <section>
              <h2 className="mb-6 text-3xl font-bold font-headline">Top Picks</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topPickItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {(featuredItems.length > 0 || topPickItems.length === 0) && (
            <section>
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
                  <p className="mt-2 text-sm text-muted-foreground">
                    Check back later for featured items, or try a search.
                  </p>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </>
  );
}
```

## 3. Restore About Us Page

The "About Us" page was emptied.

**File:** `src/app/about/page.tsx`

**Action:** Restore the original content of the "About Us" page.

```typescript
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Handshake, Target, Users } from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Oyinkansola Faith Olorunleke",
      role: "Founder & CEO",
      avatarSrc: "/team/oyin/pfp.png",
    },
    {
      name: "Jay Jay Olajitan",
      role: "Co-founder & CTO",
      avatarSrc: "/team/jay/jjpfp.png",
    },
  ]

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">Our Mission</h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            To build a trusted community marketplace where people can safely and easily rent anything, reducing waste and providing economic empowerment for everyone.
          </p>
        </section>

        {/* Our Values Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-24 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Empowerment</h3>
            <p className="text-muted-foreground">
              We empower item owners to earn extra income and renters to access what they need, when they need it.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Handshake className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trust & Safety</h3>
            <p className="text-muted-foreground">
              Your safety is our priority. We build tools and policies to foster a secure and reliable community.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-muted-foreground">
              We believe in the power of sharing and connecting with people in your local neighborhood.
            </p>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="max-w-4xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                    Rentilia was born from a simple observation: we all own creative equipment that we barely use. A specific camera lens for a single photoshoot, a high-end microphone for a one-off podcast recording, or a drone for that perfect cinematic shot. These items sit idle, collecting dust, while a fellow creator just a few blocks away is looking to use that exact same piece of gear for a project.
                </p>
                <p>
                    We thought, "What if we could create a platform that connects these two creators?" A platform that makes it as easy to rent a neighbor's gimbal as it is to order a pizza. This idea sparked the creation of Rentilia, a peer-to-peer marketplace designed to make renting media equipment simple, safe, and beneficial for everyone involved.
                </p>
                <p>
                    From a small idea sketched on a napkin, we've grown into a passionate team dedicated to building a more sustainable and community-focused world. We're just getting started, and we're thrilled to have you on this journey with us.
                </p>
            </div>
        </section>


        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto justify-items-center">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center w-full max-w-[320px] min-h-[320px]">
                <CardContent className="p-8 h-full flex flex-col">
                  <Avatar className="h-28 w-28 mx-auto mb-4">
                    <AvatarImage src={member.avatarSrc} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h4 className="text-xl font-semibold">{member.name}</h4>
                  <p className="mt-auto text-base font-semibold text-primary">{member.role}</p>
                  
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
```

## 4. Restore Footer Navigation

The footer was simplified for the waitlist mode.

**File:** `src/components/layout/footer.tsx`

**Action:** Restore the original footer with all the navigation links.

```typescript
import Link from 'next/link';
import { Logo } from '../icons/logo';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-4 md:col-span-1">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Your community marketplace for film, music, and media gear.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Rentilia, Inc.</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                <Link href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-wrap justify-center md:justify-end gap-6 text-sm md:gap-8">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground"
              >
                Contact Us
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                href="/faq"
                className="text-muted-foreground hover:text-foreground"
              >
                FAQ
              </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```
