# API & Server Actions Architecture

**Spoke Category:** System & Architecture
**Purpose:** Defines the strict conventions for data mutation, server-side execution, validation boundaries, and error handling within the NGV-ERP-APP.

---

## 1. Core Philosophy: Server Actions over API Routes

Because we are utilizing Next.js 15 (App Router), **Server Actions are the primary mechanism for all data mutations** (POST, PUT, DELETE).

- **Rule 1:** Do NOT create traditional REST API routes (`app/api/.../route.ts`) for internal frontend-to-backend communication.
- **Rule 2:** Traditional Route Handlers (`route.ts`) are strictly reserved for **External Webhooks** (e.g., receiving payment updates from Stripe, or external customs/ECGC notifications) and dynamic file generation (e.g., streaming a PDF directly).

---

## 2. Directory Structure & Naming Conventions

All Server Actions must reside in the root `/actions` directory, grouped by their domain entity.

```text
actions/
├── order.actions.ts       # Phase updates, logistics modifications
├── document.actions.ts    # S3 Presigned URLs, Doc Tagging logic
├── buyer.actions.ts       # CRM modifications
└── inventory.actions.ts   # Stock updates
```

**Naming Rules:**

- Files must be named `[entity].actions.ts`.
- Every file must start with the `"use server";` directive at the absolute top.
- Action functions must use camelCase verbs describing the exact mutation (e.g., `updateOrderLogistics`, `generateS3UploadUrl`).

---

## 3. The Standardized Action Response Signature

To ensure the frontend (especially Zustand and Shadcn forms) can predictably handle UI states, loading spinners, and error toasts, **every Server Action must return a standardized, type-safe response.**

### The `ActionState` Type

_AI Note: Assume this type is globally available or defined in `@/types`._

```typescript
export type ActionState<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

---

## 4. The Anatomy of a Server Action

Every Server Action must follow a strict 5-step implementation pattern:

1. **Zod Validation:** Parse and validate incoming data.
2. **Authentication/Authorization:** (Verify the user has permission).
3. **Database Execution:** Execute Prisma queries (using `$transaction` if multiple tables are touched).
4. **Cache Invalidation:** Call `revalidatePath` or `revalidateTag` to update the Next.js UI cache.
5. **Standardized Return:** Return the `ActionState` object.

### Example Implementation Pattern (`createBuyer`):

```typescript
'use server';

import { db } from '@/prisma/db';
import { revalidatePath } from 'next/cache';
import { CreateBuyerSchema } from '@/types/zod-schemas'; // Zod schema
import type { ActionState } from '@/types';

export async function createBuyer(formData: unknown): Promise<ActionState<any>> {
  // 1. Server-Side Zod Validation
  const parsed = CreateBuyerSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false as const,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // 2. Database Execution
    const buyer = await db.buyer.create({
      data: parsed.data,
    });

    // 3. Cache Invalidation
    // Ensure the UI immediately reflects the new data
    revalidatePath('/crm/buyers');

    // 4. Standardized Return
    return { success: true as const, data: buyer };
  } catch (error) {
    // 5. Secure Error Logging
    console.error('[CREATE_BUYER_ERROR]:', error);
    return { success: false as const, error: 'Failed to create buyer' };
  }
}
```

---

## 5. Transactional Integrity (Prisma `$transaction`)

In the Order Lifecycle module, moving an order to the next step often requires multiple database actions (e.g., saving the document metadata AND updating the `currentStepId`).

**Rule:** If a Server Action modifies more than one Prisma model, you MUST use `db.$transaction([])` or an interactive transaction to ensure atomicity. We cannot have a state where an S3 document is recorded, but the Order step fails to advance.

---

## 6. S3 Document & Storage Actions

The ERP relies heavily on AWS S3 for the Document Vault. To keep our AWS credentials secure, the frontend NEVER uploads directly using secret keys.

**Required Action Patterns (`document.actions.ts`):**

1. **`getUploadPresignedUrl(fileName: string, docTag: string, orderId: string)`**
   - **Logic:** Constructs the strict `orders/[id]/phase_[n]/[docTag]_[filename]` path.
   - **Returns:** A temporary upload URL and the final `s3Key`.
   - **Frontend Role:** The client uses this URL to PUT the file directly to S3.
2. **`getViewPresignedUrl(s3Key: string)`**
   - **Logic:** Requests a temporary read-only URL from S3 (valid for ~15 minutes).
   - **Returns:** A secure URL string that the frontend can place in an `href` or `iframe` to display the LC, BRC, or Invoice.
3. **`recordDocumentMetadata(orderId: string, docTag: string, s3Key: string, ...)`**
   - **Logic:** Called _after_ the client successfully completes the S3 PUT request to log the document in Prisma and advance the Order Phase.

---

## 7. Error Handling & Logging

- **Never leak raw database errors** to the client. Catch Prisma errors and return a sanitized, user-friendly message in the `error` property of the `ActionState`.
- **Server-side Logging:** Use `console.error("[ACTION_NAME_ERROR]", error)` inside the catch block so the server logs provide debugging context without exposing details to the browser.
