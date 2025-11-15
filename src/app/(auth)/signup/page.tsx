'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/icons/logo';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
    const router = useRouter();
    const { signUp, signInWithGoogle } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!termsAccepted) {
            toast({
                variant: 'destructive',
                title: 'Terms required',
                description: 'Please accept the terms of service to continue.',
            });
            return;
        }

        setLoading(true);

        const { error } = await signUp(email, password, fullName);

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Signup failed',
                description: error.message || 'Could not create account',
            });
            setLoading(false);
        } else {
            toast({
                title: 'Account created!',
                description: 'Welcome to Rentilia!',
            });
            router.push('/');
        }
    };

    const handleGoogleSignUp = async () => {
        if (!termsAccepted) {
            toast({
                variant: 'destructive',
                title: 'Terms required',
                description: 'Please accept the terms of service to continue.',
            });
            return;
        }

        setGoogleLoading(true);
        const { error } = await signInWithGoogle();
        
        if (error) {
            toast({
                variant: 'destructive',
                title: 'Google sign-up failed',
                description: error.message,
            });
            setGoogleLoading(false);
        }
        // Note: If successful, user will be redirected by OAuth flow
    };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Logo className="h-10 text-primary" />
          </Link>
        </div>
        <Card>
            <form onSubmit={handleSignup}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>
              Join our community to start renting and earning.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Jane Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
             <div className="flex items-start space-x-2 pt-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  required
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the <Link href="#" className="font-medium text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
                </Label>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading || googleLoading}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? 'Connecting...' : 'Sign up with Google'}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm">
            <p>Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link></p>
          </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
