'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import {
  itemBasicInfoSchema,
  itemPricingSchema,
  itemAvailabilitySchema,
  itemRequirementsSchema,
  type ItemBasicInfo,
  type ItemPricing,
  type ItemAvailability,
  type ItemRequirements,
} from '@/lib/validations/item';
import { PhotoUpload } from '@/components/items/PhotoUpload';

const CATEGORIES = [
  'Tools & Equipment',
  'Electronics',
  'Outdoor & Sports',
  'Party & Events',
  'Photography & Video',
  'Transportation',
  'Home & Garden',
  'Other',
];

type Step = 1 | 2 | 3 | 4 | 5;

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  
  // Form data storage
  const [basicInfo, setBasicInfo] = useState<ItemBasicInfo | null>(null);
  const [pricing, setPricing] = useState<ItemPricing | null>(null);
  const [availability, setAvailability] = useState<ItemAvailability | null>(null);

  // Step 1: Basic Info
  const basicInfoForm = useForm<ItemBasicInfo>({
    resolver: zodResolver(itemBasicInfoSchema),
    defaultValues: basicInfo || {
      title: '',
      description: '',
      category: '',
    },
  });

  // Step 2: Pricing
  const pricingForm = useForm<ItemPricing>({
    resolver: zodResolver(itemPricingSchema),
    defaultValues: pricing || {
      price_per_day: 0,
      replacement_value: 0,
      deposit_amount: 0,
    },
  });

  // Step 3: Availability
  const availabilityForm = useForm<ItemAvailability>({
    resolver: zodResolver(itemAvailabilitySchema),
    defaultValues: availability || {
      min_rental_days: 1,
      max_rental_days: 7,
      pickup_type: 'renter_pickup',
    },
  });

  // Step 4: Requirements
  const requirementsForm = useForm<ItemRequirements>({
    resolver: zodResolver(itemRequirementsSchema),
    defaultValues: {
      is_license_required: false,
      pickup_address: '',
    },
  });

  const handleStep1Submit = (data: ItemBasicInfo) => {
    setBasicInfo(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: ItemPricing) => {
    setPricing(data);
    setCurrentStep(3);
  };

  const handleStep3Submit = (data: ItemAvailability) => {
    setAvailability(data);
    setCurrentStep(4);
  };

  const handleStep4Continue = () => {
    if (photoUrls.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Photos required',
        description: 'Please upload at least one photo of your item',
      });
      return;
    }
    setCurrentStep(5);
  };

  const handleFinalSubmit = async (data: ItemRequirements) => {
    if (!user || !basicInfo || !pricing || !availability) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please complete all steps',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: item, error } = await supabase
        .from('items')
        .insert({
          owner_id: user.id,
          title: basicInfo.title,
          description: basicInfo.description,
          category: basicInfo.category,
          price_per_day: pricing.price_per_day,
          replacement_value: pricing.replacement_value,
          deposit_amount: pricing.deposit_amount,
          min_rental_days: availability.min_rental_days,
          max_rental_days: availability.max_rental_days,
          pickup_type: availability.pickup_type,
          is_license_required: data.is_license_required,
          pickup_address: data.pickup_address,
          photo_urls: photoUrls,
          is_available: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your item has been listed',
      });

      router.push('/dashboard/listings');
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">List a New Item</h1>
        <p className="text-muted-foreground">
          Step {currentStep} of 5: {
            currentStep === 1 ? 'Basic Information' :
            currentStep === 2 ? 'Pricing' :
            currentStep === 3 ? 'Availability' :
            currentStep === 4 ? 'Photos' :
            'Requirements'
          }
        </p>
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about your item</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={basicInfoForm.handleSubmit(handleStep1Submit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Professional DSLR Camera"
                  {...basicInfoForm.register('title')}
                />
                {basicInfoForm.formState.errors.title && (
                  <p className="text-sm text-destructive">{basicInfoForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item, its condition, and what makes it special..."
                  rows={5}
                  {...basicInfoForm.register('description')}
                />
                {basicInfoForm.formState.errors.description && (
                  <p className="text-sm text-destructive">{basicInfoForm.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) => basicInfoForm.setValue('category', value)}
                  defaultValue={basicInfoForm.getValues('category')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {basicInfoForm.formState.errors.category && (
                  <p className="text-sm text-destructive">{basicInfoForm.formState.errors.category.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pricing */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set your rental rates and deposit</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={pricingForm.handleSubmit(handleStep2Submit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_day">Price Per Day ($)</Label>
                <Input
                  id="price_per_day"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  {...pricingForm.register('price_per_day', { valueAsNumber: true })}
                />
                {pricingForm.formState.errors.price_per_day && (
                  <p className="text-sm text-destructive">{pricingForm.formState.errors.price_per_day.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="replacement_value">Replacement Value ($)</Label>
                <Input
                  id="replacement_value"
                  type="number"
                  step="0.01"
                  placeholder="500.00"
                  {...pricingForm.register('replacement_value', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  The cost to replace this item if lost or damaged beyond repair
                </p>
                {pricingForm.formState.errors.replacement_value && (
                  <p className="text-sm text-destructive">{pricingForm.formState.errors.replacement_value.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit_amount">Security Deposit ($)</Label>
                <Input
                  id="deposit_amount"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  {...pricingForm.register('deposit_amount', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  Refundable deposit held during rental (typically 20-50% of replacement value)
                </p>
                {pricingForm.formState.errors.deposit_amount && (
                  <p className="text-sm text-destructive">{pricingForm.formState.errors.deposit_amount.message}</p>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Availability */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>Set rental duration and pickup options</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={availabilityForm.handleSubmit(handleStep3Submit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_rental_days">Minimum Rental (days)</Label>
                  <Input
                    id="min_rental_days"
                    type="number"
                    {...availabilityForm.register('min_rental_days', { valueAsNumber: true })}
                  />
                  {availabilityForm.formState.errors.min_rental_days && (
                    <p className="text-sm text-destructive">{availabilityForm.formState.errors.min_rental_days.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_rental_days">Maximum Rental (days)</Label>
                  <Input
                    id="max_rental_days"
                    type="number"
                    {...availabilityForm.register('max_rental_days', { valueAsNumber: true })}
                  />
                  {availabilityForm.formState.errors.max_rental_days && (
                    <p className="text-sm text-destructive">{availabilityForm.formState.errors.max_rental_days.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup_type">Pickup Type</Label>
                <Select
                  onValueChange={(value) => availabilityForm.setValue('pickup_type', value as 'renter_pickup' | 'owner_delivery')}
                  defaultValue={availabilityForm.getValues('pickup_type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="renter_pickup">Renter Pickup</SelectItem>
                    <SelectItem value="owner_delivery">Owner Delivery</SelectItem>
                  </SelectContent>
                </Select>
                {availabilityForm.formState.errors.pickup_type && (
                  <p className="text-sm text-destructive">{availabilityForm.formState.errors.pickup_type.message}</p>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Photos */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>Upload photos of your item (at least 1 required)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PhotoUpload
              photoUrls={photoUrls}
              onPhotosChange={setPhotoUrls}
              maxPhotos={10}
            />

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={handleStep4Continue}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Requirements */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>Final details and requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={requirementsForm.handleSubmit(handleFinalSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup_address">Pickup Address</Label>
                <Textarea
                  id="pickup_address"
                  placeholder="123 Main St, City, State 12345"
                  rows={3}
                  {...requirementsForm.register('pickup_address')}
                />
                {requirementsForm.formState.errors.pickup_address && (
                  <p className="text-sm text-destructive">{requirementsForm.formState.errors.pickup_address.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_license_required"
                  onCheckedChange={(checked) => requirementsForm.setValue('is_license_required', checked as boolean)}
                />
                <Label htmlFor="is_license_required" className="text-sm font-normal cursor-pointer">
                  Require valid license or certification to rent this item
                </Label>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Listing'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
