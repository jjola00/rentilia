'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useTheme } from '@/components/theme/ThemeProvider';

export function Logo({ className }: { className?: string }) {
  const { theme, isReady } = useTheme();

  return (
    <div className={cn('flex items-center', className)}>
      {/* Show placeholder during SSR/hydration to prevent flash */}
      {!isReady ? (
        <div className="h-40 w-[750px]" />
      ) : (
        <Image
          src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
          alt="Rentilia"
          width={750}
          height={200}
          className="h-40 w-auto"
          priority
        />
      )}
    </div>
  );
}
