import { Suspense } from 'react';
import MessagesPageClient from './MessagesPageClient';

export default function MessagesPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-muted-foreground">Loading messages...</div>}
    >
      <MessagesPageClient />
    </Suspense>
  );
}
