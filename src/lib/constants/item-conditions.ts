export const ITEM_CONDITION_VALUES = [
  'brand_new',
  'excellent',
  'good',
  'fair',
  'poor',
] as const;

export type ItemCondition = typeof ITEM_CONDITION_VALUES[number];

export const ITEM_CONDITION_LABELS: Record<ItemCondition, string> = {
  brand_new: 'Brand new',
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const ITEM_CONDITION_OPTIONS = ITEM_CONDITION_VALUES.map((value) => ({
  value,
  label: ITEM_CONDITION_LABELS[value],
})) as { value: ItemCondition; label: string }[];
