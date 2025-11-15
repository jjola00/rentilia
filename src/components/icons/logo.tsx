import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Package className="h-8 w-8 text-primary" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 20"
        className="h-8 w-auto"
      >
        <text
          x="0"
          y="15"
          fontFamily="'Space Grotesk', sans-serif"
          fontSize="16"
          fontWeight="bold"
          fill="currentColor"
          className="text-primary"
        >
          Rentilia
        </text>
      </svg>
    </div>
  );
}
