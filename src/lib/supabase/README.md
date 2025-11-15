# Supabase Configuration

This directory contains the Supabase client configuration for the Rentilia application.

## Files

- **client.ts** - Browser-side Supabase client for use in Client Components
- **server.ts** - Server-side Supabase client for use in Server Components and API routes
- **types.ts** - TypeScript types for database schema
- **index.ts** - Convenient re-exports
- **test-connection.ts** - Utility to test Supabase connection

## Usage

### In Client Components

```typescript
'use client'

import { createBrowserClient } from '@/lib/supabase'

export function MyComponent() {
  const supabase = createBrowserClient()
  
  // Use supabase client...
}
```

### In Server Components

```typescript
import { createServerClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createServerClient()
  
  // Use supabase client...
}
```

### In API Routes

```typescript
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerClient()
  
  // Use supabase client...
}
```

## Environment Variables

Required environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Middleware

The `src/middleware.ts` file handles automatic session refresh for authenticated users.

## Next Steps

1. Create database schema in Supabase SQL Editor
2. Generate TypeScript types: `npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts`
3. Implement authentication flows
4. Create database queries and mutations
