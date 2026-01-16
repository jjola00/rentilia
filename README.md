# Rentilia

Rentilia is a peer-to-peer rental marketplace for listing items, booking rentals, and managing pickups/returns.

- Live site: https://rentilia.ie
- Open beta: coming soon in early 2026

## Stack

- Next.js 15 (App Router) + React 18
- Supabase (auth, database, edge functions)
- Stripe (payments)
- Tailwind CSS + Radix UI
- Vercel (hosting)

## Getting started

1) Install dependencies:

```bash
npm install
```

2) Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

3) Run the app:

```bash
npm run dev
```

The dev server runs on http://localhost:9002.

## Supabase edge function secrets

Set these in your Supabase project (Functions > Secrets):

```bash
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
RESEND_API_KEY=your-resend-api-key
```

## Scripts

```bash
npm run dev         # start dev server on port 9002
npm run build       # production build
npm run start       # start production server
npm run lint        # lint
npm run typecheck   # TypeScript checks
npm run verify-db   # run data integrity checks
npm run db:migrate  # apply SQL migrations in scripts/
```

## Database

- SQL migrations live in `supabase/migrations/`.
- Data integrity helpers live in `scripts/`.

## Deployment notes

- Frontend: Vercel (set the same `.env.local` values as project env vars).
- Supabase: configure function secrets and webhook URLs for Stripe.
