# **App Name**: Rentilia

## Core Features:

- User Authentication and Profiles: Secure user registration and profile management with Supabase Auth, custom profile fields (bio, location, avatar), terms acceptance flow, and license upload system.
- Item Listing and Management: Multi-step form for creating rental listings with pricing (daily rate, security deposit), availability settings, pickup/delivery options, license requirements, and photo uploads.
- Search and Discovery: Advanced filtering and search functionality with location-based results, category filtering, price ranges, and real-time availability checking.
- Booking and Rental Workflow: Complete rental lifecycle from request → payment → pickup confirmation → return documentation → review submission, with real-time status tracking.
- Secure Payment System: Stripe integration with separate rental payments and security deposit authorization, automatic deposit release, partial refunds for damage claims, and owner payout system.
- Messaging and Communication: In-app messaging system for renters and owners to communicate about bookings.
- Reviews and Ratings: Rating and review system for building trust and accountability in the marketplace.
- Admin Dashboard: Complete admin interface for user management, license verification, dispute resolution, and platform analytics.
- License Management: Upload and verification system for equipment requiring certification (chainsaws, vehicles, etc.) with admin approval workflow.
- Return Evidence System: Photo upload system for documenting item condition and handling damage claims with partial deposit refunds.
- Multi-role Support: Users can be both renters and owners with proper role management and role-specific dashboards.
- Technology Stack: React with TypeScript, Vite build tool, Tailwind CSS with Shadcn/ui components, React Router DOM, React Hook Form with Zod validation, React Query for state management, Supabase for database/auth/storage, Stripe for payments, date-fns for date handling.
- Database Requirements: Supabase PostgreSQL with tables for profiles, items, bookings, reviews, messages, licenses, return evidence, and user roles. Row-level security policies for data protection.

## Style Guidelines:

- Primary color: Teal (#4DB6AC) to evoke trust, security, and a sense of calm.
- Background color: Very light blue (#E0F7FA), nearly desaturated teal.
- Accent color: Yellow (#FDD835) to highlight key actions and elements.
- Headline font: 'Space Grotesk' sans-serif for headings and emphasized text; Body font: 'Inter' sans-serif for body text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use Lucide React icons for a consistent and modern look.
- Clean and modern design using Shadcn/ui components and Tailwind CSS.
- Subtle transitions and animations for improved user experience.