'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutGrid, LogOut, PlusCircle, User, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { userJane } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    const checkLogin = () => {
        const loggedInState = sessionStorage.getItem('isLoggedIn');
        setIsLoggedIn(loggedInState === 'true');
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', checkLogin); // Listen for storage changes
    checkLogin(); // Initial check

    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('storage', checkLogin);
    }
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    router.push('/dashboard');
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    router.push('/');
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage src={userJane.avatarUrl} alt={userJane.name} />
            <AvatarFallback>{userJane.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userJane.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userJane.location}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Messages</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Log In</Link>
      </Button>
      <Button asChild className='bg-primary hover:bg-primary/90'>
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );

  return (
    <header className={cn(
        'sticky top-0 z-50 w-full border-b border-transparent transition-all',
        isScrolled ? 'border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60' : ''
      )}>
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2">
            <Logo />
            </Link>
        </div>


        <div className="flex-1 flex justify-center">
            <Button variant="link" asChild>
                <Link href="/">Browse Items</Link>
            </Button>
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <Button variant="outline" className="hidden sm:flex" asChild>
            <Link href="/listings/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              List an Item
            </Link>
          </Button>
          {(isLoggedIn ? <UserMenu /> : <AuthButtons />)}
        </div>
      </div>
    </header>
  );
}
