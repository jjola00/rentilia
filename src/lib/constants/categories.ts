export const CATEGORIES = [
  'Tools & Equipment',
  'Party & Events',
  'Electronics',
  'Sports & Outdoors',
  'Vehicles',
  'Photography & Video',
  'Home & Garden',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];
