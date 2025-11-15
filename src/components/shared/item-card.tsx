import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Rating from '@/components/shared/rating';
import type { Item } from '@/lib/types';
import { MapPin } from 'lucide-react';

type ItemCardProps = {
  item: Item;
};

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/listings/${item.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={item.imageUrls[0]}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="rental item"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2">{item.category}</Badge>
          <CardTitle className="mb-2 line-clamp-2 h-[3rem] text-lg font-headline font-semibold">
            {item.title}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
            <span>{item.location}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 pt-0">
            <div className="flex flex-col">
                <p className="text-xl font-bold text-foreground">${item.dailyRate}<span className="text-sm font-normal text-muted-foreground">/day</span></p>
                <Rating rating={item.rating} reviewCount={item.reviewCount} />
            </div>
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={item.owner.avatarUrl} alt={item.owner.name} />
                    <AvatarFallback>{item.owner.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
