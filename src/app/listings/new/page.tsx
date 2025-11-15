'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, FileCheck2, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function NewListingPage() {
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Card>
        <CardHeader>
          {step > 1 && (
            <Button variant="ghost" size="sm" className="absolute left-4 top-4" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          <div className="flex flex-col items-center text-center">
            <CardTitle className="text-3xl font-headline">List an Item</CardTitle>
            <CardDescription className="mt-2">
              Follow the steps to get your item listed on Rentilia.
            </CardDescription>
            <Progress value={(step / totalSteps) * 100} className="mt-4 w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <form>
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-lg font-medium">Item Title</Label>
                  <Input id="title" placeholder="e.g., Professional DSLR Camera" />
                  <p className="text-sm text-muted-foreground">
                    A catchy and descriptive title will help renters find your item.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-lg font-medium">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tools">Tools & Equipment</SelectItem>
                      <SelectItem value="party">Party & Events</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="sports">Sports & Outdoors</SelectItem>
                      <SelectItem value="vehicles">Vehicles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-lg font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail. Include its condition, what's included, and any special instructions."
                    rows={6}
                  />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dailyRate" className="text-lg font-medium">Daily Rental Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="dailyRate" type="number" placeholder="50.00" className="pl-7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityDeposit" className="text-lg font-medium">Security Deposit</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="securityDeposit" type="number" placeholder="200.00" className="pl-7" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is a hold placed on the renter's card, released after the item is returned safely.
                  </p>
                </div>
                <div className="space-y-2">
                    <Label className="text-lg font-medium">Pickup & Delivery</Label>
                     <RadioGroup defaultValue="pickup" className="flex gap-4 pt-2">
                        <Label htmlFor="r1" className="flex items-center gap-2 p-4 border rounded-md cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <RadioGroupItem value="pickup" id="r1" />
                            Pickup Only
                        </Label>
                         <Label htmlFor="r2" className="flex items-center gap-2 p-4 border rounded-md cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <RadioGroupItem value="both" id="r2" />
                            Pickup & Delivery
                        </Label>
                    </RadioGroup>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium">Upload Photos</Label>
                  <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-border px-6 py-10">
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                        <Label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80"
                        >
                          <span>Upload files</span>
                          <Input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                        </Label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
                 <div className="space-y-2">
                  <Label className="text-lg font-medium">License Requirement</Label>
                   <p className="text-sm text-muted-foreground pb-2">
                    Does this item require a special license or certification to operate? (e.g., driver's license, chainsaw certification)
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="license-required" />
                    <Label htmlFor="license-required">Yes, a license is required.</Label>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-8 flex justify-end">
              {step < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next Step
                </Button>
              ) : (
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <FileCheck2 className="mr-2 h-4 w-4" />
                  Finish & List Item
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
