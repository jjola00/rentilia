'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className={cn('relative flex min-h-dvh flex-col', { 'bg-card': isDashboard })}>
          {!isDashboard && <Header />}
          <main className={cn({ 'flex-1': !isDashboard })}>{children}</main>
          {!isDashboard && <Footer />}
        </div>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
