# Performance & Memory Caching Architecture

**Spoke Category:** System & Architecture
**Purpose:** Defines the strict rules for data fetching, cache invalidation, database query optimization, and UI rendering strategies to ensure the ERP remains blazing fast while strictly preventing stale or leaked data.
**CRITICAL SYNC RULE:** Any new data fetching utility or Server Action that mutates state MUST adhere to the cache invalidation protocols defined here. Leaking stale financial data to a user is a critical system failure.

---

## 1. Core Philosophy: The Next.js 15 Paradigm

In an ERP, data accuracy supersedes raw speed. We are dealing with real-time inventory, financial invoices, and active order statuses.

- **Rule 1: Next.js 15 Defaults.** By default, Next.js 15 **does not** cache `fetch` requests. We embrace this. The majority of the ERP will utilize **Dynamic Rendering**.
- **Rule 2: No Cross-Tenant Caching.** We never globally cache data that belongs to a specific user or role.
- **Rule 3: Memoization over Persistence.** We rely heavily on React's `cache()` to deduplicate database queries within a single render cycle, rather than persisting DB data across multiple requests.

---

## 2. Server-Side Data Caching (The DAL Pattern)

Because we use Prisma (which connects directly to the DB and bypasses the native Next.js `fetch` API), we must manually deduplicate queries to prevent overloading the database during complex page renders.

We enforce the **Data Access Layer (DAL)** pattern using React's `cache()`.

### 2.1 Request-Level Memoization (`React.cache`)

If an Order's data is needed by the Header, the Sidebar, and the Main Content, we do NOT fetch it three times. We wrap the Prisma call in `cache()`.

```typescript
// lib/dal/order.ts
import { cache } from 'react';
import db from '@/prisma/db';

// React.cache ensures this query only runs ONCE per page load,
// even if called by 5 different Server Components simultaneously.
export const getOrderById = cache(async (orderId: string) => {
  return await db.order.findUnique({
    where: { id: orderId },
    include: { buyer: true, documents: true },
  });
});
```

### 2.2 Static Reference Data (Time-Based Revalidation)

Certain ERP data rarely changes (e.g., Global Currency Rates, HSN Codes, Country Compliance Rules). For these, we use Next.js `unstable_cache` to store the result in memory/Redis across _all_ users, revalidating periodically.

```typescript
// lib/dal/reference-data.ts
import { unstable_cache } from 'next/cache';
import db from '@/prisma/db';

export const getHSNCodes = unstable_cache(
  async () => {
    return await db.hsnCode.findMany();
  },
  ['hsn-codes-cache'], // Cache Key
  { revalidate: 86400, tags: ['hsn'] } // Revalidate every 24 hours
);
```

---

## 3. The Cache Invalidation Protocol

When data changes via a Server Action, the UI must reflect this instantly. We do not force hard browser reloads. We use precise Cache Invalidation.

### 3.1 Targeted Invalidation (`revalidatePath`)

Whenever a Server Action mutates data, it MUST call `revalidatePath` for the specific route affected before returning the response.

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import db from '@/prisma/db';

export async function updateOrderStatus(orderId: string, status: string) {
  await db.order.update({
    where: { id: orderId },
    data: { status },
  });

  // Purge the cache for this specific order's dashboard
  revalidatePath(`/orders/${orderId}`);
  // Purge the global list view
  revalidatePath('/orders/list');

  return { success: true };
}
```

---

## 4. Client-Side Performance & UI Responsiveness

Network latency cannot be eliminated, but perceived latency can be hidden.

### 4.1 Optimistic UI (`useOptimistic`)

For high-frequency actions (like toggling a task complete, or changing a minor status), we use React 19's `useOptimistic` hook. The UI updates instantly while the Server Action runs in the background.

```tsx
'use client';

import { useOptimistic, startTransition } from 'react';
import { updateOrderStatus } from '@/actions/order.actions';

export function StatusToggle({ order }) {
  const [optimisticStatus, addOptimisticStatus] = useOptimistic(
    order.status,
    (state, newStatus: string) => newStatus
  );

  const handleToggle = async (newStatus: string) => {
    startTransition(() => {
      addOptimisticStatus(newStatus); // Instantly update UI
    });

    // Background execution
    await updateOrderStatus(order.id, newStatus);
  };

  return (
    <Badge
      className={optimisticStatus === 'PRODUCTION' ? 'bg-blue-500' : 'bg-gray-500'}
      onClick={() => handleToggle('PRODUCTION')}
    >
      {optimisticStatus}
    </Badge>
  );
}
```

### 4.2 Lazy Loading Heavy Client Assets

The ERP will use heavy libraries for PDF generation (`pdfmake` or `@react-pdf/renderer`) and charts (`recharts`). These MUST NOT be included in the initial page bundle.

- **Rule:** Heavy client components must be dynamically imported using `next/dynamic`.

```tsx
// DO NOT do this at the top of the file:
// import OrderAnalyticsChart from './OrderAnalyticsChart';

// DO THIS:
import dynamic from 'next/dynamic';

const OrderAnalyticsChart = dynamic(() => import('./OrderAnalyticsChart'), {
  ssr: false, // Charts often rely on window/DOM, so disable Server-Side Rendering
  loading: () => <div className="h-64 w-full animate-pulse bg-slate-100 rounded-md" />,
});
```

---

## 5. Database Performance Optimization

A fast Next.js server is useless if the Postgres database is a bottleneck.

### 5.1 Strict Payload Selection

Never use `SELECT *` (or Prisma's default behavior) for list views. If a table has 50 columns and you only need 4, you MUST specify them. This radically reduces memory consumption and network transfer time.

```typescript
// ❌ BAD: Fetches heavy text fields, document blobs, etc.
const orders = await db.order.findMany();

// ✅ GOOD: Fetches only the required bytes for the table layout
const orders = await db.order.findMany({
  select: {
    id: true,
    poNumber: true,
    status: true,
    buyer: { select: { name: true } },
  },
});
```

### 5.2 Connection Pooling (Serverless Edge)

Because Next.js deployed on Vercel/AWS operates in serverless environments, standard database connections will quickly exhaust Postgres connection limits during scaling.

- **Architecture Requirement:** The Prisma instance MUST be routed through a Connection Pooler.
- **Implementation:** Utilize **PgBouncer** (if hosting via Supabase/AWS RDS) or **Prisma Accelerate**. The `DATABASE_URL` in `.env` must point to the pooled port (e.g., `6543`), not the direct connection port (e.g., `5432`).

---

## 6. Avoiding Data Fetching Waterfalls

A "waterfall" occurs when sequential `await` calls block each other, multiplying the total load time. In Server Components, we must fetch independent data streams in parallel.

### 6.1 Parallel Fetching (`Promise.all`)

If a dashboard requires multiple independent datasets, never `await` them one by one.

```typescript
// ❌ BAD: Waterfall (Takes 3 seconds total if each takes 1s)
const orders = await db.order.findMany();
const inventoryAlerts = await db.inventory.findMany({ where: { stock: { lt: 10 } } });
const financialSummary = await db.finance.getSummary();

// ✅ GOOD: Parallel (Takes 1 second total)
const [orders, inventoryAlerts, financialSummary] = await Promise.all([
  db.order.findMany(),
  db.inventory.findMany({ where: { stock: { lt: 10 } } }),
  db.finance.getSummary(),
]);
```

### 6.2 Streaming with React Suspense

If one query is significantly slower than the others (e.g., a massive financial aggregate), do not let it block the entire page load. Wrap the slow component in `<Suspense>` so the rest of the page streams to the user immediately.

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import FinancialChart from './FinancialChart'; // Slow component
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Fast components load instantly */}
      <QuickStats />

      {/* Slow component streams in later */}
      <Suspense fallback={<Skeleton className="w-full h-64" />}>
        <FinancialChart />
      </Suspense>
    </div>
  );
}
```

---

## 7. Next.js 15 & React 19 Specific Optimizations

Next.js 15 introduces paradigm-shifting features that replace old React optimization techniques.

### 7.1 The React Compiler (No more `useMemo`)

Next.js 15 utilizes the React 19 Compiler. It automatically memoizes values and functions under the hood.

- **Rule:** Do NOT manually wrap values in `useMemo` or functions in `useCallback` purely for performance in Client Components. Write clean, idiomatic React and let the compiler handle the memoization.

### 7.2 Partial Prerendering (PPR)

PPR is a Next.js 15 feature that combines static and dynamic rendering on the same route.

- **Architecture Standard:** For complex layouts (like the main ERP shell), the Sidebar and Header should be statically generated, while the main content area is dynamic. Next.js 15 handles this automatically when you wrap the dynamic portions in `<Suspense>`.

---
