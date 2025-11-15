import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingProps = {
  rating: number;
  reviewCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
    sm: { star: 'h-3 w-3', text: 'text-xs'},
    md: { star: 'h-4 w-4', text: 'text-sm'},
    lg: { star: 'h-5 w-5', text: 'text-base'},
}

export default function Rating({ rating, reviewCount, className, size = 'md' }: RatingProps) {
  return (
    <div className={cn('flex items-center gap-1 text-muted-foreground', className)}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
                sizeClasses[size].star,
              i < Math.floor(rating) ? 'text-accent fill-accent' : 'text-gray-300'
            )}
          />
        ))}
      </div>
      <span className={cn('font-medium text-foreground', sizeClasses[size].text)}>{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className={cn('ml-1', sizeClasses[size].text)}>({reviewCount})</span>
      )}
    </div>
  );
}
