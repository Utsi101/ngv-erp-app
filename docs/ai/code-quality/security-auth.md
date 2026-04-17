# Security, Authentication & RBAC Standards

**Spoke Category:** System Security & Access Control  
**Purpose:** Defines the exhaustive protocols for user identity verification, Role-Based Access Control (RBAC), route protection, cryptographic standards, and threat mitigation within the Next.js 15 App Router environment.
**CRITICAL SYNC RULE:** Any new API route, Server Action, or database mutation MUST undergo an RBAC permission check. Bypassing the authentication utilities defined in this document is a severe violation and will result in immediate CI/CD rejection.

---

## 1. Core Philosophy: The Zero-Trust Model

1. **Verify at Every Layer:** Do not rely solely on Middleware to protect routes. A malicious user can bypass the UI and hit a Server Action directly. You must verify identity and permissions in the Middleware, the Server Component, AND the Server Action.
2. **Deny by Default:** Unless a route or action is explicitly marked as public, it must be completely inaccessible.
3. **Granular Permissions over Broad Roles:** Checking `if (user.role === 'ADMIN')` is an anti-pattern. We check _capabilities_, e.g., `if (hasPermission(user, 'approve:invoice'))`.
4. **Assume Compromise:** Passwords must be heavily hashed, secrets rotated, and all mutations must leave an immutable audit trail.

---

## 2. Authentication Architecture (Auth.js v5)

We utilize **Auth.js (NextAuth v5)**. It is edge-compatible, secure by default, and natively integrates with Next.js 15 App Router.

### 2.1 Session Strategy (JWT + Database)

- We use a **JWT (JSON Web Token) Strategy** for fast edge reads without database bottlenecking.
- **Max Age:** Sessions expire strictly after **8 hours**. No persistent "Remember Me" for 30 days in an ERP.
- **Token Payload Minimum:** The JWT must only contain non-sensitive identifiers (`id`, `role`, `email`). NEVER store PII, passwords, or full permission arrays in the token.

### 2.2 Password Cryptography

- **Rule:** Plaintext passwords, MD5, and SHA-256 are strictly forbidden.
- **Standard:** All passwords MUST be hashed using **Argon2id**. If Argon2 cannot be run in your specific edge environment, **Bcrypt (Cost Factor 12+)** is the only acceptable fallback.

---

## 3. Role-Based Access Control (RBAC)

We use a flat role structure mapped to granular permissions.

### 3.1 The Permission Matrix

Permissions are defined as string constants using the `resource:action` format. This must be maintained in `src/types/auth.types.ts`.

```typescript
// src/types/auth.types.ts
export type Role = 'SUPER_ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'GUEST';

export const PERMISSIONS = {
  // Orders
  ORDER_READ: 'order:read',
  ORDER_CREATE: 'order:create',
  ORDER_APPROVE: 'order:approve',
  // Invoices
  INVOICE_GENERATE: 'invoice:generate',
  // System
  USER_MANAGE: 'user:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Centralized Role-to-Permission Mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS), // Has everything
  MANAGER: [PERMISSIONS.ORDER_READ, PERMISSIONS.ORDER_CREATE, PERMISSIONS.ORDER_APPROVE],
  ACCOUNTANT: [PERMISSIONS.ORDER_READ, PERMISSIONS.INVOICE_GENERATE],
  GUEST: [PERMISSIONS.ORDER_READ],
};
```

### 3.2 The `hasPermission` Utility

Never write custom role-checking logic inline. Always use the central utility.

```typescript
// src/lib/auth/permissions.ts
export function hasPermission(userRole: Role, requiredPermission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(requiredPermission);
}
```

---

## 4. The 3-Layer Protection Protocol

Security must be enforced at three distinct layers of the application.

### Layer 1: Edge Middleware (The Gateway)

The `middleware.ts` file intercepts every request before it hits the Next.js server. Its ONLY job is to redirect unauthenticated users away from private routes. It does _not_ do deep DB checks.

```typescript
// middleware.ts
import { auth } from '@/lib/auth/auth-config';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = req.nextUrl.pathname === '/login';

  if (isApiAuthRoute) return NextResponse.next();

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### Layer 2: Server Components (The View Layer)

Before rendering sensitive UI components, the Server Component must check permissions. If they lack the permission, render `notFound()` or a `<Forbidden />` component.

```tsx
// src/app/(dashboard)/orders/[id]/page.tsx
import { auth } from '@/lib/auth/auth-config';
import { hasPermission, PERMISSIONS } from '@/types/auth.types';
import { notFound } from 'next/navigation';

export default async function OrderPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user || !hasPermission(session.user.role, PERMISSIONS.ORDER_READ)) {
    return notFound(); // Silently fail to prevent data enumeration
  }

  // Safe to fetch and render
}
```

### Layer 3: Server Actions (The Critical Boundary)

**This is the most attacked vector in Next.js.** Attackers can bypass the UI and send POST requests directly to Server Actions. Every action MUST establish authorization context internally.

```typescript
// src/actions/order.actions.ts
'use server';

import { auth } from '@/lib/auth/auth-config';
import { hasPermission, PERMISSIONS } from '@/types/auth.types';
import { ActionState } from '@/types';
import db from '@/prisma/db';

export async function approveOrder(orderId: string): Promise<ActionState<string>> {
  try {
    // 1. Establish Auth Context (CRITICAL)
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized.' };
    }

    // 2. Establish Permission Context (CRITICAL)
    if (!hasPermission(session.user.role, PERMISSIONS.ORDER_APPROVE)) {
      // Log this attempt! It could be a malicious escalation attempt.
      console.error(`[SECURITY] User ${session.user.id} attempted unauthorized order approval.`);
      return { success: false, error: 'Forbidden: Insufficient privileges.' };
    }

    // 3. Execution...
    await db.order.update({ where: { id: orderId }, data: { status: 'APPROVED' } });
    return { success: true, data: 'Approved', message: 'Order approved.' };
  } catch (error) {
    return handleServerError(error); // From error-validation.md
  }
}
```

---

## 5. Threat Mitigation & Hardening

### 5.1 Cross-Site Scripting (XSS)

- **Rule:** React escapes variables in JSX by default. However, `dangerouslySetInnerHTML` is **strictly forbidden** across the entire codebase.
- **Data Parsing:** All incoming string data must be validated by Zod to strip script tags if necessary.

### 5.2 SQL / NoSQL Injection

- **Rule:** We use Prisma ORM. You MUST NEVER use raw SQL queries (`$queryRaw`) using unsanitized string interpolation. If raw SQL is absolutely necessary for complex analytics, you must use Prisma's tagged template literals which utilize parameterized queries natively.

```typescript
// ❌ CRITICAL VULNERABILITY
await db.$queryRawUnsafe(`SELECT * FROM "Order" WHERE buyer = '${userInput}'`);

// ✅ SECURE
await db.$queryRaw`SELECT * FROM "Order" WHERE buyer = ${userInput}`;
```

### 5.3 Cross-Site Request Forgery (CSRF)

- **Rule:** Auth.js natively handles CSRF protection via double-submit cookies. Ensure that `trustHost: true` is configured correctly in the Auth.js initialization.

### 5.4 Rate Limiting & Brute Force Prevention

- **Rule:** The `/login` Server Action must be strictly rate-limited using Upstash Redis.
- **Standard:** Maximum 5 login attempts per IP per 5 minutes. Subsequent attempts must lock the IP and return a 429 Too Many Requests response.

---

## 6. Cryptography & Secrets Management

### 6.1 Environment Variables

- **Rule:** Never prefix an environment variable with `NEXT_PUBLIC_` unless you want it shipped to the browser bundle. Only URLs (like CloudFront Domain) and public Keys (Stripe Publishable Key) can be public.
- **Rule:** Secrets (Database URLs, Auth Secrets, JWT Secrets, Private RSA Keys) must be strictly server-side.

### 6.2 Data at Rest (PII Encryption)

- **Rule:** If the ERP stores highly sensitive Buyer data (e.g., Bank Account numbers, national tax IDs), they MUST NOT be stored in plaintext in Postgres.
- **Implementation:** Use Prisma Client Extensions to automatically encrypt these fields using `crypto.createCipheriv(aes-256-gcm)` before saving, and decrypt after reading.

---

## 7. Audit Trails & Compliance

In an ERP, if an invoice amount changes, the system must know exactly who changed it.

### 7.1 Mutation Accountability

- **Rule:** Every Prisma model that deals with business logic MUST have an `updatedById` field.
- **Rule:** Every Server Action that performs an `update` or `delete` must stamp the operation with the `session.user.id`.

```typescript
// ✅ Audit Compliant DB Mutation
await db.invoice.update({
  where: { id: invoiceId },
  data: {
    amount: newAmount,
    updatedById: session.user.id, // Critical for audit trails
  },
});
```

### 7.2 Deletion Policy (Soft Deletes)

- **Rule:** The `delete` operation in Prisma is banned for core business models (Orders, Invoices, Buyers, Documents).
- **Implementation:** Use **Soft Deletes**. Add an `isDeleted: Boolean` and `deletedAt: DateTime` field. Filter active records in your Prisma queries. True deletions are reserved exclusively for legal compliance (e.g., GDPR Right to be Forgotten) executed directly by Super Admins.

---

## 8. Security Coding Conventions (Do's and Don'ts)

- **DON'T** log the `session` object or `request` payloads to the console if they contain passwords or tokens.
- **DON'T** return the entire user object to the client. Always omit the `passwordHash` and `twoFactorSecret` from any API response or Server Action return value.
- **DO** use exact matching (`===`) for role checks, never loose matching (`==`).
- **DO** ensure that any file download endpoints verify that the user requesting the document belongs to the Organization/Company that owns the document (Insecure Direct Object Reference - IDOR protection).
- **DO** keep your Next.js and Auth.js dependencies updated to patch CVEs immediately.

---
