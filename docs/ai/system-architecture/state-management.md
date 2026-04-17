# State Management Architecture

**Spoke Category:** System & Architecture
**Purpose:** Defines the strict paradigms for managing Server State, Client State, URL State, and Form State within the Next.js 15 App Router ecosystem.
**CRITICAL SYNC RULE:** If a new global UI state is introduced or a new Zustand store is created, you MUST update this file to document its purpose and boundaries.

---

## 1. Core Philosophy: The App Router Paradigm

In a modern Next.js 15 application, **the Server is the primary State Manager.** \* **Rule 1:** We do NOT use global state managers (like Redux or Zustand) to store database records, API responses, or business data.

- **Rule 2:** Client-side state (Zustand/React Context) is strictly reserved for **Ephemeral UI State** (e.g., is a modal open, which tab is active, multi-step form progress).
- **Rule 3:** The database is the single source of truth. Data flows down from React Server Components (RSC) to Client Components via props.

---

## 2. Server State (Data Management)

We do not use `SWR` or `React Query` for standard CRUD operations. We rely natively on Next.js Server Components and Cache Invalidation.

### 2.1 Reading Data

- Data is fetched asynchronously directly inside Server Components (`page.tsx`, `layout.tsx`).
- **Pattern:**
  ```tsx
  // app/orders/[id]/page.tsx
  export default async function OrderCommandCenter({ params }: { params: { id: string } }) {
    const order = await db.order.findUnique({ where: { id: params.id } });
    return <OrderTimeline order={order} />; // Pass data down as props
  }
  ```

### 2.2 Mutating & Invalidating Data

- Data is mutated using **Server Actions** (see `api-server-actions.md`).
- When an action completes, we update the UI instantly by invalidating the Next.js cache using `revalidatePath()` or `revalidateTag()`. The server automatically re-fetches the updated data and streams the new UI to the client without page reloads.

---

## 3. URL State (Search Params)

In an ERP, **URL State is the most important state for data tables and filters.**

- **Rule:** Any state that dictates what data is displayed on the screen (Pagination, Search Queries, Status Filters) **MUST** be stored in the URL Search Params, NOT in Zustand or `useState`.
- **Why?** It makes views deep-linkable (users can share a link to "Page 2 of Production Orders"), survives page refreshes, and allows the Server Component to read the state and fetch the correct data before rendering.

### Implementation Standard:

```tsx
// URL: /orders/list?status=PRODUCTION&page=2

// Server Component reads the URL state natively
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const statusFilter = searchParams.status || 'ALL';
  const data = await fetchOrders(statusFilter);
  // ...
}
```

---

## 4. Client UI State (Zustand)

When state is purely interactive, volatile, and doesn't belong in the URL or the Database, we use **Zustand**.

### 4.1 Allowed Use Cases for Zustand:

1. **Global UI Toggles:** Managing the centralized "Slide-Out Panel" (Sheet) across different components.
2. **Multi-Step Wizards:** Tracking the steps of the PDF Generation Modal before the final payload is sent to the server.
3. **Cross-Component Client Triggers:** E.g., A button in a header triggering a print function in a distant child component.

### 4.2 Zustand Anti-Patterns (STRICTLY FORBIDDEN):

- ❌ Fetching an order on the server and calling `useOrderStore.setState({ order })`. This creates a desynced double-source-of-truth. Pass the order down via props instead.

### 4.3 Standard Implementation (The Slices Pattern)

Stores must be modularized and placed in the `/store` directory.

```typescript
// store/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  // Slide-out Sheet Management
  isOrderEditSheetOpen: boolean;
  activeOrderIdForEdit: string | null;
  openOrderEditSheet: (orderId: string) => void;
  closeOrderEditSheet: () => void;

  // PDF Generator Modal
  isPdfGeneratorOpen: boolean;
  pdfContext: { orderId: string; docType: string } | null;
  openPdfGenerator: (context: { orderId: string; docType: string }) => void;
  closePdfGenerator: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOrderEditSheetOpen: false,
  activeOrderIdForEdit: null,
  openOrderEditSheet: (orderId) =>
    set({ isOrderEditSheetOpen: true, activeOrderIdForEdit: orderId }),
  closeOrderEditSheet: () => set({ isOrderEditSheetOpen: false, activeOrderIdForEdit: null }),

  isPdfGeneratorOpen: false,
  pdfContext: null,
  openPdfGenerator: (context) => set({ isPdfGeneratorOpen: true, pdfContext: context }),
  closePdfGenerator: () => set({ isPdfGeneratorOpen: false, pdfContext: null }),
}));
```

---

## 5. Form State (React Hook Form)

Forms in an ERP are massive. Native React `useState` for inputs will cause severe performance degradation due to continuous re-rendering.

- **Rule:** All data mutation forms MUST use **React Hook Form (RHF)**.
- **Validation Integration:** RHF must be paired with `@hookform/resolvers/zod` using the strict Zod schemas defined in `@/types/zod-schemas.ts`.
- **Component Usage:** We use the `Form`, `FormField`, `FormItem`, and `FormControl` primitives provided by Shadcn/UI, which natively wrap React Hook Form for accessible, performance-optimized inputs.

### Standard Form Implementation Flow:

1. Component mounts (Client Component).
2. RHF initializes with `defaultValues` passed down from the Server Component via props.
3. User types (no global re-renders occur due to RHF's uncontrolled architecture).
4. User submits. RHF triggers Zod validation.
5. If valid, RHF `onSubmit` calls the Next.js **Server Action**.
6. Server Action returns `success: true`.
7. UI Store closes the Sheet/Modal. UI updates automatically via server cache invalidation.
