
import Image from 'next/image';
import { items } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Rating from '@/components/shared/rating';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { MapPin, ShieldCheck, Truck, Package } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ListingPage({ params }: { params: { id: string } }) {
  const item = items.find((i) => i.id === params.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        {/* Left column */}
        <div className="md:col-span-2">
          <Carousel className="w-full rounded-lg overflow-hidden">
            <CarouselContent>
              {item.imageUrls.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video">
                    <Image
                      src={url}
                      alt={`${item.title} image ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint="rental item"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>

          <div className="mt-8">
            <Badge variant="secondary">{item.category}</Badge>
            <h1 className="mt-2 font-headline text-4xl font-bold">
              {item.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>{item.location}</span>
            </div>
            
            <Separator className="my-6" />

            <h2 className="font-headline text-2xl font-semibold">Description</h2>
            <p className="mt-4 text-muted-foreground">{item.description}</p>
            
            <Separator className="my-6" />

            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={item.owner.avatarUrl} alt={item.owner.name} />
                <AvatarFallback>{item.owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">Owned by {item.owner.name}</h3>
                <p className="text-sm text-muted-foreground">Member since {format(item.owner.memberSince, 'MMMM yyyy')}</p>
                <Button variant="link" className="p-0 h-auto mt-1" asChild>
                    <Link href="#">View profile</Link>
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            <h2 className="font-headline text-2xl font-semibold">
              Reviews ({item.reviewCount})
            </h2>
            <div className="mt-4 space-y-6">
                {item.reviews.slice(0, 2).map(review => (
                    <div key={review.id} className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={review.user.avatarUrl} alt={review.user.name} />
                            <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold">{review.user.name}</p>
                                <p className="text-xs text-muted-foreground">{format(review.date, 'MMM d, yyyy')}</p>
                            </div>
                            <Rating rating={review.rating} size="sm" className="my-1"/>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>
            {item.reviewCount > 2 && <Button variant="outline" className="mt-6">Show all {item.reviewCount} reviews</Button>}

          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl">
                <span className="font-bold">${item.dailyRate}</span>
                <span className="text-base font-normal text-muted-foreground">
                  /day
                </span>
              </CardTitle>
              <div className="pt-2">
                <Rating rating={item.rating} reviewCount={item.reviewCount} />
              </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="mb-2 text-sm font-medium">Select dates</p>
                        <Calendar
                            mode="range"
                            className="rounded-md border"
                        />
                    </div>
                    <Button size="lg" className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90">Request to Book</Button>
                    <div className="text-center text-sm text-muted-foreground">You won't be charged yet</div>
                    <Separator/>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span>${item.dailyRate} x 0 nights</span>
                            <span>$0</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Service fee</span>
                            <span>$0</span>
                        </div>
                    </div>
                    <Separator/>
                    <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>$0</span>
                    </div>
                    <div className="text-sm text-muted-foreground p-4 bg-secondary/50 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold">Security Deposit</h4>
                                <p className="text-xs">A ${item.securityDeposit} hold will be placed on your card and released after the item is returned undamaged.</p>
                            </div>
                        </div>
                    </div>
                     <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold">Pickup available</h4>
                                <p className="text-xs">Location: {item.location}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold">Delivery available</h4>
                                <p className="text-xs">Owner may offer delivery. Discuss in messages.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
