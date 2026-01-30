'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';
import { useConfetti } from '@/hooks/use-confetti';

export default function WaitlistPage() {
  const { toast } = useToast();
  const triggerConfetti = useConfetti();

  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCompany = company.trim();

    // Honeypot check - silently succeed if bot filled it
    if (trimmedCompany) {
      setSuccess(true);
      setEmail('');
      setCompany('');
      return;
    }

    if (!trimmedEmail) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address to join the waitlist.',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({
        variant: 'destructive',
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            variant: 'destructive',
            title: 'Too many attempts',
            description: 'Please wait a moment before trying again.',
          });
          return;
        }
        throw new Error(data.error || 'Signup failed');
      }

      if (data.duplicate) {
        toast({
          title: 'Already on the list',
          description: 'This email is already registered for the waitlist.',
        });
      } else if (!data.emailSent) {
        toast({
          title: "You're on the list!",
          description: 'Signup saved, but confirmation email could not be sent.',
        });
      }

      setSuccess(true);
      triggerConfetti();
      setEmail('');
      setCompany('');
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: 'Could not add you to the waitlist. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-2xl text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Beta 2026</p>
        <h1 className="text-4xl md:text-6xl font-bold font-headline">Join the Rentilia waitlist</h1>
        <p className="text-muted-foreground text-lg">
          Be first to access Rentilia when the beta opens this year. We’ll email you with early access details.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Get early access
            </CardTitle>
            <CardDescription>
              We’ll only use your email for beta updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <h2 className="text-xl font-semibold">You’re on the list 🎉</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Watch your inbox for confirmation and beta launch updates.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSuccess(false)}
                >
                  Add another email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div
                  className="absolute left-[-10000px] top-auto h-0 w-0 overflow-hidden"
                  aria-hidden="true"
                >
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join waitlist'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
