import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Rentilia - Rent Anything, Anywhere',
  description: 'A peer-to-peer rental marketplace for film, music, and media equipment.',
};

const themeScript = `
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // Ignore storage errors.
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
