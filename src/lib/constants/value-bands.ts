export const VALUE_BANDS = [
  { value: '0_250', min: 0, max: 250, label: '€0-€250' },
  { value: '250_500', min: 250, max: 500, label: '€250-€500' },
  { value: '500_1000', min: 500, max: 1000, label: '€500-€1,000' },
  { value: '1000_2500', min: 1000, max: 2500, label: '€1,000-€2,500' },
  { value: '2500_5000', min: 2500, max: 5000, label: '€2,500-€5,000' },
  { value: '5000_plus', min: 5000, max: null, label: '€5,000+' },
] as const;

export type ValueBand = typeof VALUE_BANDS[number]['value'];

export const VALUE_BAND_OPTIONS = VALUE_BANDS.map(({ value, label }) => ({
  value,
  label,
}));

export const getValueBandForAmount = (
  amount: number | null | undefined
): ValueBand | null => {
  if (amount === null || amount === undefined || Number.isNaN(amount) || amount < 0) {
    return null;
  }

  if (amount <= 250) return '0_250';
  if (amount <= 500) return '250_500';
  if (amount <= 1000) return '500_1000';
  if (amount <= 2500) return '1000_2500';
  if (amount <= 5000) return '2500_5000';
  return '5000_plus';
};

export const getValueBandLabel = (band: ValueBand | null | undefined): string => {
  if (!band) return 'Not set';
  const match = VALUE_BANDS.find((entry) => entry.value === band);
  return match ? match.label : 'Not set';
};
