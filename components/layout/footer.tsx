import Link from 'next/link';
import { Logo } from '../icons/logo';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground text-center md:text-left">
              Your community marketplace for film, music, and media gear.
            </p>
          </div>
          <div className="text-center md:text-right">
             <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Rentilia, Inc.</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                <Link href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
