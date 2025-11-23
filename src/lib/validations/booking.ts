import { z } from 'zod';

export const bookingRequestSchema = z.object({
  item_id: z.string().uuid('Invalid item ID'),
  start_datetime: z.date({
    required_error: 'Please select a start date',
  }),
  end_datetime: z.date({
    required_error: 'Please select an end date',
  }),
}).refine((data) => data.end_datetime > data.start_datetime, {
  message: 'End date must be after start date',
  path: ['end_datetime'],
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
