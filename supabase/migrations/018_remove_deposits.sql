alter table public.items
  drop column if exists deposit_amount;

alter table public.bookings
  drop column if exists deposit_amount;

alter table public.bookings
  drop column if exists deposit_pi_id;
