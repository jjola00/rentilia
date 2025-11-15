import Link from 'next/link';
import { Logo } from '../icons/logo';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Rent anything, anywhere. Your community marketplace.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Rentilia, Inc. All rights reserved.</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                <Link href="#">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm md:gap-8">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                About Us
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Contact Us
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
