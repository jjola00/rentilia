import type { Category } from '@/lib/constants/categories';

export const CATEGORY_VALUE_CAPS: Record<Category, number> = {
  'Tools & Equipment': 3000,
  'Party & Events': 2500,
  'Electronics': 3000,
  'Sports & Outdoors': 2500,
  'Vehicles': 15000,
  'Photography & Video': 5000,
  'Home & Garden': 2000,
  'Other': 1500,
};

export const getCategoryValueCap = (category: string | null | undefined): number | null => {
  if (!category) return null;
  const cap = CATEGORY_VALUE_CAPS[category as Category];
  return typeof cap === 'number' ? cap : null;
};
