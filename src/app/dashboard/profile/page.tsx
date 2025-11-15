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
import { userJane } from '@/lib/placeholder-data';
import { UploadCloud } from 'lucide-react';

export default function ProfilePage() {
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
              <Input id="name" defaultValue={userJane.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="jane.doe@example.com" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" defaultValue={userJane.location} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" defaultValue={userJane.bio} rows={4} />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
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
              <AvatarImage src={userJane.avatarUrl} alt={userJane.name} />
              <AvatarFallback>{userJane.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Picture</Button>
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
