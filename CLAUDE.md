# NGV-ERP-APP: AI Assistant Context Hub (.CLAUDE.md)

**Role:** Senior Software Architect & Expert Collaborator
**Domain:** Merchant Export Business (Leather Products)
**Philosophy:** "Hub and Spoke" Context Architecture. This file acts as the central router. Do not guess business logic; always refer to the specific 'Spoke' files listed below before generating code or architectural solutions.

---

## 1. Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Shadcn/UI
- **State Management:** Zustand (Client-side) & Next.js Server Actions (Server-side)
- **Database ORM:** Prisma (Instance imported from `@/prisma/db`)
- **Validation:** Zod
- **Storage:** Amazon S3 (configured via `AWS_REGION`, `AWS_S3_BUCKET_NAME`, etc.)

---

## 2. Development Workflow (CRITICAL INSTRUCTIONS)

As the AI Assistant, you must adhere to the following workflow for every request:

1. **Acknowledge Context:** Before writing _any_ code, you **MUST declare which Spoke files you are using for context**. (e.g., _"Based on `ui-components.md` and `order-lifecycle.md`, here is the implementation..."_)
2. **Type Safety:** Always prioritize strict TypeScript typing and Zod validation schemas for any data entering or exiting the system.
3. **Database Integrity:** Always use the initialized Prisma client and ensure atomic updates via Server Actions.

---

## 3. The Context Router

Map the user's task to the relevant Spoke files below. Read the corresponding markdown file(s) before attempting to solve the problem.

### A. General Coding, Architecture, & APIs

If the task involves setting up database models, writing Server Actions, configuring state, or general app architecture, refer to:

- `docs/ai/system-architecture/architecture.md`
- `docs/ai/system-architecture/db-schema.md`
- `docs/ai/system-architecture/api-server-actions.md`
- `docs/ai/system-architecture/state-management.md`
- `docs/ai/system-architecture/storage-infrastructure.md`

### B. UI, Code Quality, & Standards

If the task involves building interfaces, ensuring performance, handling errors, or security, refer to:

- `docs/ai/code-quality/quality-conventions.md`
- `docs/ai/code-quality/ui-components.md`
- `docs/ai/code-quality/error-validations.md`
- `docs/ai/code-quality/performance-caching.md`
- `docs/ai/code-quality/security-auth.md`

🚨 **Data Mutation UI Standard:** If the task involves creating complex forms or mutating substantial data, **enforce the Slide-Out Panel (Sheet) pattern** as the primary UI standard, as defined in `ui-components.md`. Do not use center-screen modals for complex data entry.

### C. Feature-Specific Business Logic

If the task involves specific domain features, pull the exact business logic spoke:

- **Order Management & Lifecycle:** Refer to `docs/ai/business-logic/order-lifecycle.md` and `docs/ai/business-logic/document-vault-pdf.md`.
- **Products & Inventory:** Refer to `docs/ai/business-logic/products-inventory.md`.
- **Dashboard & Analytics:** Refer to `docs/ai/business-logic/dashboard-analytics.md`.
- **Business/Company Profile:** Refer to `docs/ai/business-logic/business-profile.md` (Use this for managing core exporter details, IEC, AD Codes, bank information, etc.).
  _(Apply this routing pattern for any future business logic spokes added to the directory)._

---

## 4. State-Machine Guardrail (Strict Isolation)

⚠️ **CRITICAL DOMAIN RULE:** The 4-Phase, 31-Step logic is **strictly local to the Order Lifecycle Management module**. Do not apply this state-machine logic to other modules (Inventory, CRM, Dashboard, Business Profile) unless explicitly requested by the user.

However, you must **always respect the "Manual S3 Gate" and "Document Tagging" standards** (as defined in `storage-infrastructure.md` and `document-vault-pdf.md`) for **all** document-related features across the entire application.
