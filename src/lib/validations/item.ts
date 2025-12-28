import { z } from 'zod';
import { ITEM_CONDITION_VALUES } from '@/lib/constants/item-conditions';
import { getCategoryValueCap } from '@/lib/constants/category-caps';

export const itemBasicInfoSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Please select a category'),
  condition: z.enum(ITEM_CONDITION_VALUES, {
    required_error: 'Please select a condition',
  }),
});

export const itemPricingSchema = z.object({
  price_per_day: z.number().min(1, 'Price must be at least €1').max(10000, 'Price must be less than €10,000'),
  replacement_value: z.number().min(1, 'Replacement value must be at least €1').max(1000000, 'Replacement value must be less than €1,000,000'),
  deposit_amount: z.number().min(0, 'Deposit cannot be negative').max(10000, 'Deposit must be less than €10,000'),
});

export const itemAvailabilitySchema = z.object({
  min_rental_days: z.number().int().min(1, 'Minimum rental must be at least 1 day').max(365, 'Maximum rental cannot exceed 365 days'),
  max_rental_days: z.number().int().min(1, 'Maximum rental must be at least 1 day').max(365, 'Maximum rental cannot exceed 365 days'),
  pickup_type: z.enum(['renter_pickup', 'owner_delivery'], {
    required_error: 'Please select a pickup type',
  }),
}).refine((data) => data.max_rental_days >= data.min_rental_days, {
  message: 'Maximum rental days must be greater than or equal to minimum rental days',
  path: ['max_rental_days'],
});

export const itemRequirementsSchema = z.object({
  is_license_required: z.boolean(),
  pickup_address: z.string().min(10, 'Please provide a complete pickup address').max(200, 'Address must be less than 200 characters'),
});

const baseAvailabilitySchema = z.object({
  min_rental_days: z.number().int().min(1, 'Minimum rental must be at least 1 day').max(365, 'Maximum rental cannot exceed 365 days'),
  max_rental_days: z.number().int().min(1, 'Maximum rental must be at least 1 day').max(365, 'Maximum rental cannot exceed 365 days'),
  pickup_type: z.enum(['renter_pickup', 'owner_delivery'], {
    required_error: 'Please select a pickup type',
  }),
});

export const completeItemSchema = itemBasicInfoSchema
  .merge(itemPricingSchema)
  .merge(baseAvailabilitySchema)
  .merge(itemRequirementsSchema)
  .refine((data) => data.max_rental_days >= data.min_rental_days, {
    message: 'Maximum rental days must be greater than or equal to minimum rental days',
    path: ['max_rental_days'],
  })
  .superRefine((data, ctx) => {
    const cap = getCategoryValueCap(data.category);
    if (cap && data.replacement_value > cap) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['replacement_value'],
        message: `Replacement value exceeds €${cap.toLocaleString()} cap for ${data.category}.`,
      });
    }
  });

export type ItemBasicInfo = z.infer<typeof itemBasicInfoSchema>;
export type ItemPricing = z.infer<typeof itemPricingSchema>;
export type ItemAvailability = z.infer<typeof itemAvailabilitySchema>;
export type ItemRequirements = z.infer<typeof itemRequirementsSchema>;
export type CompleteItem = z.infer<typeof completeItemSchema>;
