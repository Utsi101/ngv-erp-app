# System Architecture (NGV-ERP-APP)

**Spoke Category:** System & Architecture
**Purpose:** Defines the foundational architectural patterns, data flow, and structural rules for the NGV-ERP-APP. This file governs _how_ the application is built, acting as the structural blueprint for all feature development.

---

## 1. High-Level System Overview

NGV-ERP-APP is a modern, web-based Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) system tailored for a Leather Goods Merchant Export business.

It is designed to handle complex, state-driven workflows (like the 4-Phase Order Lifecycle) alongside standard CRUD operations (Inventory, CRM, Business Profiles) with a heavy emphasis on secure, compliance-driven document management.

---

## 2. Technology Stack & Responsibilities

The system strictly adheres to the following stack. Do not introduce alternative libraries for these core responsibilities without explicit architectural approval.

- **Framework:** Next.js 15 (App Router).
- **Language:** TypeScript (Strict mode enabled).
- **Frontend UI:** Tailwind CSS + Shadcn/UI primitives.
- **Client State:** Zustand (for transient UI state, modals, and multi-step client logic).
- **Server State & Data Fetching:** React Server Components (RSC).
- **Data Mutation:** Next.js Server Actions.
- **Validation boundary:** Zod (used for both client-side form validation and server-side action payload validation).
- **Database:** Neon Postgres, managed via Prisma ORM.
- **Storage:** Amazon S3 (accessed via `@aws-sdk/client-s3` using environment variables).

---

## 3. Core Architectural Patterns

### 3.1 Server-First Data Flow

The application leans heavily on Next.js 15 server capabilities to reduce client-side JavaScript and ensure direct database connections.

1.  **Read Operations:** Handled primarily by React Server Components (`page.tsx`, `layout.tsx`). Data is fetched directly from Prisma and passed down to client components as props.
2.  **Write Operations:** Handled exclusively by Next.js Server Actions (stored in the `actions/` directory).
3.  **Validation:** Every Server Action MUST parse incoming data using a Zod schema before executing Prisma queries.

### 3.2 The "Sheet" Pattern for Data Mutation

**Rule:** Standard center-screen modals MUST NOT be used for complex data entry or multi-field forms.

- **Pattern:** All substantial data mutations (e.g., modifying Order Details, creating a new Buyer, adding Inventory) must utilize the **Slide-Out Panel (Shadcn `Sheet`)**.
- **Why:** This maintains the visual context of the underlying page (like the Order Timeline) while providing a high-density vertical canvas for scalable forms.

### 3.3 The "Document Vault" Paradigm

File storage is completely decoupled from the database, linked only by strict metadata.

- **Storage:** Actual files are uploaded to AWS S3.
- **Database:** Prisma stores the metadata (`docTag`, `standardFileName`, `s3Key`).
- **Security:** S3 buckets are strictly private. The frontend requests Presigned URLs via Server Actions to upload or view documents.

### 3.4 Contextual Document Generation

PDF generation (e.g., Proforma Invoice, Commercial Invoice) follows a **"Modify First, Generate Second"** pattern.

1.  User mutates the underlying database record via a Slide-Out Sheet.
2.  User triggers the PDF Overlay (`InvoiceModal`).
3.  The modal consumes the _live_ database state, ensuring generated PDFs always perfectly match the system's source of truth.

---

## 4. Directory Structure Rules

The repository follows a feature-driven Next.js App Router structure. AI agents must place files in their designated locations:

To be added later

---

## 5. Security & Environment Guardrails

- **API Keys:** No AWS keys, Neon connection strings, or secret hashes are ever exposed to the client. All direct external service communication happens in Server Actions or Route Handlers.
- **Environment Variables:** Use `process.env.VARIABLE_NAME` strictly on the server. Prefix with `NEXT_PUBLIC_` only if absolutely required by a client component.
- **Atomic Transactions:** When an operation involves multiple database updates (e.g., updating an order status AND logging a timeline event), it MUST be wrapped in a `$transaction` using Prisma to prevent orphaned data.
