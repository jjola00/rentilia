import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    category: string;
    price_per_day: number;
    photo_urls: string[] | null;
    [key: string]: any;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  const hasPhotos = item.photo_urls && Array.isArray(item.photo_urls) && item.photo_urls.length > 0;

  return (
    <Link href={`/listings/${item.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full bg-muted">
            {hasPhotos && item.photo_urls && item.photo_urls[0] ? (
              <Image
                src={item.photo_urls[0]}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2">{item.category}</Badge>
          <CardTitle className="mb-2 line-clamp-2 h-[3rem] text-lg font-semibold">
            {item.title}
          </CardTitle>
        </CardContent>
        <CardFooter className="flex justify-between p-4 pt-0">
          <div className="flex flex-col">
            <p className="text-xl font-bold text-foreground">
              ${item.price_per_day}
              <span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
