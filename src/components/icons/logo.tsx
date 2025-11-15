import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 20"
      className={cn('h-8 w-auto', className)}
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
  );
}
