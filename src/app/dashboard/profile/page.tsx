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
import { UploadCloud, Loader2, X, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useProfile } from '@/hooks/use-profile';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile, refreshProfile, displayName, userInitial } = useProfile();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [removingLicense, setRemovingLicense] = useState(false);
  const [licenseUrl, setLicenseUrl] = useState('');
  const [licensePath, setLicensePath] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      loadLicense();
    }
  }, [profile]);

  const loadLicense = async () => {
    if (!user) return;

    // Load license if exists - Fixed query
    const { data: licenseData } = await supabase
      .from('licenses')
      .select('document_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

    if (licenseData && licenseData.document_url) {
      setLicensePath(licenseData.document_url);
      // Create a signed URL for the stored path
      const { data: urlData } = await supabase.storage
        .from('licenses')
        .createSignedUrl(licenseData.document_url, 60 * 60 * 24); // 24 hour expiry
      
      if (urlData) {
        setLicenseUrl(urlData.signedUrl);
      }
    } else {
      setLicenseUrl('');
      setLicensePath('');
    }
  };

  const handleSave = async () => {
    setLoading(true);

    const result = await updateProfile({
      full_name: fullName,
      phone,
      city,
      bio,
    });

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile',
      });
    }

    setLoading(false);
  };  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file',
        description: 'Please upload an image file',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'File must be less than 5MB',
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Update the profiles table via our hook
      const result = await updateProfile({ avatar_url: publicUrl });

      if (!result.success) {
        throw new Error('Failed to update profile');
      }

      // Update local state immediately
      setAvatarUrl(publicUrl);

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload profile picture',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type (images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file',
        description: 'Please upload an image (JPG, PNG, WebP) or PDF file',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'File must be less than 10MB',
      });
      return;
    }

    setUploadingLicense(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('licenses')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // For private bucket, we'll store the path and create signed URLs when needed
      const { data: urlData, error: urlError } = await supabase.storage
        .from('licenses')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      if (urlError) throw urlError;

      setLicenseUrl(urlData.signedUrl);
      setLicensePath(filePath);

      // Check if license already exists
      const { data: existingLicense } = await supabase
        .from('licenses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingLicense) {
        // Update existing license
        const { error: licenseError } = await supabase
          .from('licenses')
          .update({
            document_url: filePath,
            license_type: 'drivers_license',
            is_verified: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (licenseError) throw licenseError;
      } else {
        // Insert new license
        const { error: licenseError } = await supabase
          .from('licenses')
          .insert({
            user_id: user.id,
            document_url: filePath,
            license_type: 'drivers_license',
            is_verified: false,
          });

        if (licenseError) throw licenseError;
      }

      toast({
        title: 'Success',
        description: 'License uploaded successfully. Awaiting verification.',
      });
    } catch (error) {
      console.error('Error uploading license:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload license',
      });
    } finally {
      setUploadingLicense(false);
    }
  };

  const handleLicenseRemove = async () => {
    if (!user || !licensePath) {
      setLicenseUrl('');
      setLicensePath('');
      return;
    }

    setRemovingLicense(true);
    try {
      const { error: deleteError } = await supabase
        .from('licenses')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const { error: storageError } = await supabase.storage
        .from('licenses')
        .remove([licensePath]);

      if (storageError) {
        console.error('License storage cleanup failed:', storageError);
        toast({
          variant: 'destructive',
          title: 'License removed',
          description: 'Record removed, but file cleanup failed.',
        });
      } else {
        toast({
          title: 'License removed',
          description: 'Your license document has been removed.',
        });
      }

      setLicenseUrl('');
      setLicensePath('');
    } catch (error) {
      console.error('Error removing license:', error);
      toast({
        variant: 'destructive',
        title: 'Remove failed',
        description: 'Failed to remove license document',
      });
    } finally {
      setRemovingLicense(false);
    }
  };

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
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Change Picture'
              )}
            </Button>
            <p className="text-xs text-muted-foreground">Max 5MB, JPG, PNG or WebP</p>
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
            {licenseUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-lg border-2 border-border overflow-hidden">
                  <img 
                    src={licenseUrl} 
                    alt="License document" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={handleLicenseRemove}
                      disabled={removingLicense}
                    >
                      {removingLicense ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                  <span>Awaiting verification</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center rounded-lg border-2 border-dashed border-border px-6 py-10">
                <div className="text-center">
                  {uploadingLicense ? (
                    <>
                      <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                      <p className="mt-4 text-sm text-muted-foreground">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                        <Label
                          htmlFor="license-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80"
                        >
                          <span>Upload your license</span>
                          <Input 
                            ref={licenseInputRef}
                            id="license-upload" 
                            name="license-upload" 
                            type="file" 
                            accept="image/*,.pdf"
                            onChange={handleLicenseUpload}
                            className="sr-only" 
                          />
                        </Label>
                      </div>
                      <p className="text-xs leading-5">Max 10MB, Images or PDF</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
