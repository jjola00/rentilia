'use client';

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  CalendarDays,
  User,
  MessageSquare,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useProfile } from '@/hooks/use-profile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { displayName, userInitial, avatarUrl } = useProfile();
  
  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/listings', label: 'My Listings', icon: Box },
    { href: '/dashboard/bookings', label: 'My Bookings', icon: CalendarDays },
    { href: '/dashboard/profile', label: 'Edit Profile', icon: User },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };


  return (
    <ProtectedRoute>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <Link href="/">
                <Logo />
              </Link>
              <SidebarTrigger className="md:hidden" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className='border-t'>
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
                <p className="font-semibold truncate">{displayName}</p>
                 <button onClick={handleLogout} className="text-xs text-muted-foreground truncate hover:underline">Logout</button>
              </div>
              <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden ml-auto" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-background">
          <header className="flex h-16 items-center gap-4 border-b px-6">
            <SidebarTrigger className="hidden md:flex" />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                  <Link href="/">
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Back to site</span>
                  </Link>
              </Button>
              <h1 className="text-lg font-semibold font-headline">Dashboard</h1>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
