import Link from 'next/link';
import { Logo } from '../icons/logo';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Rent anything, anywhere. Your community marketplace.
            </p>
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Rentilia, Inc. All rights reserved.
                </p>
                <div className="flex space-x-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="#">
                    <Linkedin className="h-5 w-5" />
                    </Link>
                </Button>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm md:col-span-2 md:grid-cols-3">
             <ul className="space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
            </ul>
             <ul className="space-y-2">
                 <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Contact Us
                    </Link>
                </li>
            </ul>
             <ul className="space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
