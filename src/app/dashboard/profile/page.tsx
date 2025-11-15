'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UploadCloud } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setCity(data.city || '');
      setState(data.state || '');
      setBio(data.bio || '');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        city,
        state,
        bio,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    }

    setLoading(false);
  };

  const userName = user?.user_metadata?.full_name || user?.email || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={user?.email || ''} 
                disabled 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  placeholder="San Francisco"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={loading}
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <Button variant="outline" disabled>Change Picture (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>License Verification</CardTitle>
            <CardDescription>
              Upload a driver&apos;s license for verification to rent certain items.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex justify-center rounded-lg border-2 border-dashed border-border px-6 py-10">
                <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                    <Label
                        htmlFor="license-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80"
                    >
                        <span>Upload your license</span>
                        <Input id="license-upload" name="license-upload" type="file" className="sr-only" />
                    </Label>
                    </div>
                    <p className="text-xs leading-5">Secure and encrypted</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
