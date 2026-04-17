# Error Handling & Validation Standards

**Spoke Category:** Code Quality & Standardization
**Purpose:** Defines the strict paradigms for data validation, Server Action response types, database error masking, and UI error boundaries to ensure a secure, fail-safe ERP environment.
**CRITICAL SYNC RULE:** All new Server Actions MUST return the standardized `ActionState` defined in this document. Any new database schema changes require immediate updates to their corresponding Zod schemas.

---

## 1. Core Philosophy: Fail Fast, Fail Safely

- **Single Source of Truth:** We use **Zod** for all validation. The Zod schema dictates both frontend form validation and backend payload verification.
- **Never Trust the Client:** Even if React Hook Form validates data on the frontend, the Server Action MUST re-validate the incoming payload.
- **Zero Leakage:** Database errors, AWS stack traces, and internal server codes MUST NEVER leak to the client. They must be intercepted, logged securely, and mapped to user-friendly messages.

---

## 2. The Standardized Server Response (`ActionState`)

To ensure the frontend knows exactly how to handle server responses, every single Server Action must return a strict TypeScript generic type: `ActionState<T>`.

### 2.1 The Type Definition

This must be globally available in `@/types/index.ts`.

```typescript
export type ActionState<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

### 2.2 Implementation in Server Actions

Every Server Action follows a strict 3-step pattern: Parse, Execute, Catch.

```typescript
'use server';

import { z } from 'zod';
import { ActionState } from '@/types';
import { OrderSchema } from '@/types/zod-schemas';

export async function createOrder(data: unknown): Promise<ActionState<string>> {
  try {
    // 1. Strict Parsing (Throws ZodError if invalid)
    const parsedData = OrderSchema.parse(data);

    // 2. Execution
    const newOrder = await db.order.create({ data: parsedData });

    return {
      success: true,
      data: newOrder.id,
      message: 'Order created successfully.',
    };
  } catch (error) {
    // 3. Centralized Error Handling
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed.',
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    // Abstracted DB Error Handler (See Section 4)
    return handleServerError(error);
  }
}
```

---

## 3. Data Validation Architecture (Zod + React Hook Form)

Validation is a two-way street. We tie our Zod schemas directly into our UI components using `@hookform/resolvers/zod`.

### 3.1 Zod Schema Placement

- All schemas reside in `@/types/zod-schemas.ts` or a modularized `@/types/schemas/` directory.
- Schemas should exactly mirror the Prisma models, plus any UI-specific transient fields (e.g., `confirmPassword`).

### 3.2 Frontend Implementation Rule

When building forms, you must use the Shadcn UI `Form` primitives, which automatically handle accessibility (ARIA) and error state mapping.

```tsx
// Inside a Client Component Form
const form = useForm<z.infer<typeof OrderSchema>>({
  resolver: zodResolver(OrderSchema),
  defaultValues: { buyerId: '', totalAmount: 0 },
});

const onSubmit = async (data: z.infer<typeof OrderSchema>) => {
  const result = await createOrder(data);

  if (!result.success) {
    if (result.fieldErrors) {
      // Map server-side validation errors back to specific inputs
      Object.entries(result.fieldErrors).forEach(([key, value]) => {
        form.setError(key as any, { type: 'server', message: value[0] });
      });
    } else {
      toast.error(result.error); // Generic or DB error
    }
  } else {
    toast.success(result.message);
    closeSheet(); // Reset UI state
  }
};
```

---

## 4. Database & Infrastructure Error Masking

Prisma and AWS throw highly technical errors. Exposing a Prisma `P2002` error (Unique Constraint Violation) reveals your database schema to the client.

### 4.1 The Global Error Handler

All catch blocks in Server Actions must pass unknown errors to a global utility function: `handleServerError()`.

```typescript
// lib/error-utils.ts
import { Prisma } from '@prisma/client';
import { ActionState } from '@/types';

export function handleServerError(error: unknown): { success: false; error: string } {
  console.error('[SERVER_ERROR_LOG]', error); // Log securely to server console/DataDog

  // 1. Prisma Known Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return { success: false, error: 'A record with this value already exists.' };
      case 'P2025':
        return { success: false, error: 'The requested record was not found.' };
      default:
        return { success: false, error: 'A database error occurred. Please try again.' };
    }
  }

  // 2. AWS S3 / CloudFront Errors
  if (error instanceof Error && error.name === 'SignatureDoesNotMatch') {
    return { success: false, error: 'Document access expired or denied.' };
  }

  // 3. Fallback
  return { success: false, error: 'An unexpected internal server error occurred.' };
}
```

---

## 5. Next.js App Router Error Boundaries

While Server Actions handle data mutation errors, we must also handle **rendering and data fetching errors** gracefully using Next.js file conventions.

### 5.1 `error.tsx` (Component-Level Boundaries)

- Every major route group (e.g., `app/(dashboard)/orders/`) MUST have an `error.tsx` file.
- **Purpose:** Catches rendering errors or failed async Server Component fetches without crashing the entire layout (e.g., the Sidebar stays active).

```tsx
// app/(dashboard)/orders/error.tsx
'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function OrdersErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log rendering error to Sentry/PostHog
    console.error('Orders Route Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-10 border border-red-200 bg-red-50 rounded-lg">
      <h2 className="text-xl font-bold text-red-700">Failed to load orders</h2>
      <p className="text-red-500 mb-4 text-sm">
        Our servers encountered an issue retrieving this data.
      </p>
      <Button onClick={() => reset()} variant="destructive">
        Try Again
      </Button>
    </div>
  );
}
```

### 5.2 `not-found.tsx` (404 Handling)

- Use the `notFound()` function natively imported from `next/navigation` when a database query returns null for a requested page (e.g., viewing an order ID that doesn't exist).
- This triggers the nearest `not-found.tsx` file instead of crashing or rendering empty data.

```typescript
// Example usage in page.tsx
const order = await db.order.findUnique({ where: { id: params.id } });
if (!order) notFound();
```

---

## 6. Observability & Structured Logging

In a serverless deployment (Vercel/AWS), standard `console.log()` statements are difficult to parse and alert on. All server-side errors must use a structured logger.

### 6.1 The Logging Standard

- We use a structured logger like **Pino** or a cloud-native logger like **Sentry**.
- **Rule:** NEVER log PII (Personally Identifiable Information) or sensitive data (passwords, AWS keys, full document contents). Log IDs, actions, and error codes.

### 6.2 Implementation in `handleServerError`

Update the error utility to use the structured logger:

```typescript
import { logger } from '@/lib/logger'; // Abstracted logger instance

export function handleServerError(error: unknown, context?: Record<string, any>) {
  // 1. Secure Logging (Includes context like userId or actionName, but NO payload data)
  logger.error({
    message: 'Server Action Failed',
    error: error instanceof Error ? error.message : 'Unknown Error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
  });

  // ... proceed with error masking (Prisma/AWS handling)
}
```

---
