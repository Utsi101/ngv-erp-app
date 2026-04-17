# Code Quality & Coding Conventions

**Spoke Category:** Code Quality & Standardization  
**Purpose:** Defines the immutable rules for TypeScript usage, component architecture, naming conventions, file structure, and deployment gating to ensure maximum readability, maintainability, and zero-friction collaboration.
**CRITICAL SYNC RULE:** All PRs (Pull Requests) and AI-generated code MUST adhere to these guidelines. Code that violates these naming conventions or structural paradigms will automatically fail CI/CD pipeline checks.

---

## 1. Core Philosophy: The Clean Code Mandate

1. **Readability > Cleverness:** Code is read 10x more often than it is written. Avoid "clever" one-liners if a 3-line standard `if/else` is easier to read and debug.
2. **Server-First Execution:** Default to React Server Components (RSC). Only use `"use client"` when interactivity (state, hooks, event listeners) is strictly required. Push client boundaries as far down the component tree as possible.
3. **Fail Fast, Return Early:** Use guard clauses to handle errors and edge cases at the very top of functions. Deeply nested `if` statements are an anti-pattern.

---

## 2. Directory Architecture (Modular Type-Based)

To keep the codebase predictable as it scales, we organize the root directory by **Technical Concern** (Actions, Components, Types), but we organize _inside_ those folders by **Business Domain** (Orders, Inventory, CRM).

### 2.1 The Standard Tree

```text
src/
 ├── actions/              # ALL Server Actions, grouped by domain
 │    ├── order.actions.ts
 │    └── document.actions.ts
 ├── app/                  # ONLY Next.js routing, pages, and layouts
 ├── components/           # ALL UI Components
 │    ├── ui/              # Generic, reusable components (e.g., Shadcn buttons, inputs)
 │    ├── orders/          # Domain-specific components (e.g., OrderTimeline, OrderTable)
 │    └── layout/          # Global layout wrappers (e.g., Sidebar, Header)
 ├── lib/                  # Global utilities, DB clients, and formatters
 ├── store/                # Zustand client-side state stores
 └── types/                # Zod schemas and global TypeScript interfaces
```

### 2.2 The "Component Pollution" Rule

- **Rule:** If a component is specific to Orders (e.g., `InvoicePDFGenerator`), it MUST go into `src/components/orders/`. It should **never** be placed directly in the root `src/components/` folder. The root component folder must remain strictly clean and categorized.

---

## 3. Universal Naming Conventions

Naming is the most critical element of a maintainable codebase. We enforce a strict, globally standardized naming convention.

### 3.1 File & Directory Names

- **Rule:** All files and directories MUST use `kebab-case`. No exceptions.
- **Why:** Prevents catastrophic case-sensitivity bugs between macOS/Windows local machines and Linux CI/CD environments.
- **Examples:** `order-dashboard.tsx`, `order.actions.ts`, `use-debounce.ts`.

### 3.2 Variables & Functions

- **Rule:** Use `camelCase`. Function names MUST be action-oriented verbs.
- **Examples:** `calculateTotalTax()`, `fetchOrderById()`, `orderList`.

### 3.3 React Components & Types/Interfaces

- **Rule:** Use `PascalCase`.
- **Examples:** `<OrderTimeline />`, `interface UserProfile {}`, `type InvoiceStatus`.

### 3.4 Booleans

- **Rule:** Boolean variables MUST be prefixed with `is`, `has`, `should`, or `can` to instantly identify them as true/false values.
- **Examples:** `isLoading`, `hasPermission`, `shouldRevalidate`.
- **Anti-Pattern:** ❌ `loading`, ❌ `permission`, ❌ `error` (use `hasError` or `errorMsg`).

### 3.5 Constants

- **Rule:** Global or file-level configuration constants MUST use `UPPER_SNAKE_CASE`.
- **Examples:** `MAX_UPLOAD_SIZE_MB`, `API_RETRY_LIMIT`.

---

## 4. TypeScript Strictness & Type Architecture

We leverage TypeScript to catch bugs at compile-time, not runtime.

### 4.1 The `any` Ban

- **Rule:** The `any` type is strictly forbidden.
- **Alternative:** If the shape of data is truly unknown (e.g., parsing a third-party webhook), use `unknown` and validate it using Zod before interacting with it.

### 4.2 Types vs. Interfaces

- **Use `interface`** for defining the shape of objects, database models, and component props. Interfaces are easier for the TS compiler to merge and cache.
- **Use `type`** for unions, intersections, primitives, and utility types.

### 4.3 DRY Types with Zod Inference

- **Rule:** Do not write a TypeScript interface and a Zod schema for the same payload. Write the Zod schema as the single source of truth and infer the TypeScript type from it.

```typescript
import { z } from 'zod';

export const OrderSchema = z.object({
  buyerId: z.string(),
  totalAmount: z.number().positive(),
});

// ✅ Infer the TS type automatically
export type OrderInput = z.infer<typeof OrderSchema>;
```

---

## 5. React Component Architecture

### 5.1 Destructuring Props

- **Rule:** Always destructure props directly in the component signature. Do not use `props.property` inside the component body.

### 5.2 Early Returns (Guard Clauses)

- **Rule:** Handle loading states, null checks, and errors at the top of the component to keep the main return statement "happy path" clean and unindented.

```tsx
// ✅ GOOD: Flat structure, easy to read
export function OrderDetails({ order }: { order: Order | null }) {
  if (!order) return <NotFoundUI />;
  if (order.status === 'DELETED') return <DeletedNotice />;

  return <div className="main-layout">{/* Happy path UI */}</div>;
}
```

---

## 6. Styling Standards (Tailwind CSS)

### 6.1 Dynamic Classes with `cn` Utility

- **Rule:** Never use standard string concatenation for dynamic classes. It leads to specificity and override bugs. Always use the `cn` utility (a wrapper around `clsx` and `tailwind-merge`) provided in `lib/utils.ts`.

```tsx
// ❌ BAD
<div className={`p-4 rounded ${isActive ? 'bg-blue-500' : 'bg-gray-200'} ${className}`} />

// ✅ GOOD
<div className={cn("p-4 rounded bg-gray-200", isActive && "bg-blue-500", className)} />
```

### 6.2 Avoid Arbitrary Values

- **Rule:** Rely on the Tailwind config theme (`text-lg`, `p-4`). Avoid arbitrary brackets like `w-[342px]` unless absolutely necessary for a one-off pixel-perfect alignment. If you use it multiple times, add it to `tailwind.config.ts`.

---

## 7. Import Conventions & Zero Magic Numbers

### 7.1 Strict Import Ordering

To prevent "import spaghetti," we rely on strict ordering, enforced by Prettier/ESLint plugins.

1. React & Next.js core packages (`react`, `next/link`).
2. Third-party NPM packages (`zod`, `lucide-react`).
3. Absolute imports for local aliases (`@/components/...`, `@/lib/...`).
4. Relative imports (`./styles.css`, `../utils`).

### 7.2 Zero Magic Numbers

- **Rule:** Hardcoded "magic numbers" or strings in the middle of business logic are strictly forbidden. Extract them to clearly named constants.

```typescript
// ❌ BAD: What is 0.18? What is 30?
if (daysOverdue > 30) applyPenalty(amount * 0.18);

// ✅ GOOD: Self-documenting
const LATE_PENALTY_THRESHOLD_DAYS = 30;
const DEFAULT_TAX_RATE = 0.18;
if (daysOverdue > LATE_PENALTY_THRESHOLD_DAYS) applyPenalty(amount * DEFAULT_TAX_RATE);
```

---

## 8. Testing & CI/CD Enforcements

"Industry-ready" means code does not reach the `main` branch unless it is mathematically proven to work.

### 8.1 The Testing Pyramid

1. **Unit Tests (Vitest):** Mandatory for all complex utility functions, tax calculators, and date formatters in `/lib` or `/utils`.
2. **Integration Tests:** Mandatory for critical Server Actions (e.g., `createOrder`). Mock the Prisma database using `vitest-mock-extended`.
3. **End-to-End (E2E) Tests (Playwright):** Mandatory for the core "Golden Paths" of the ERP (e.g., User logs in -> Creates Order -> Uploads Document -> Generates Invoice).

### 8.2 Pre-Commit Hooks (Husky & Lint-Staged)

No developer can commit code locally if it violates these conventions.

- **ESLint:** Enforces unused imports, strict TypeScript rules, and React hooks dependencies.
- **Prettier:** Automatically formats code layout (spacing, quotes).
- **Rule:** If `npm run lint` or `npm run typecheck` fails, the Git commit will be aborted automatically. Never bypass hooks using `--no-verify` unless absolutely necessary for a hotfix.
