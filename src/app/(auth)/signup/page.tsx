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

export default function SignupPage() {
    const router = useRouter();
    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd have signup logic here.
        // For this demo, we'll just simulate the login.
        sessionStorage.setItem('isLoggedIn', 'true');
        router.push('/dashboard');
    }

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
              <Input id="name" placeholder="Jane Doe" required/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required/>
            </div>
             <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" required/>
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the <Link href="#" className="font-medium text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
                </Label>
            </div>
            <Button type="submit" className="w-full mt-2">Create Account</Button>
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
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">Google</Button>
                <Button variant="outline">Facebook</Button>
            </div>
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
