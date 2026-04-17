# UI/UX & Component Architecture

**Spoke Category:** Frontend & User Experience  
**Purpose:** Defines the exhaustive protocols for building responsive, accessible, and highly performant React components. It governs styling paradigms, animation rules, breakpoint management, and accessibility (a11y) standards.
**CRITICAL SYNC RULE:** We do not invent custom UI elements if a Shadcn/Radix primitive exists. Consistency is paramount. All components MUST adhere to the WCAG 2.1 AA accessibility standards outlined below.

---

## 1. Core Philosophy: The Professional UI

1. **Content Over Chrome:** The ERP is a tool, not a marketing site. UI elements must recede, allowing the data (Invoices, Orders, Analytics) to take center stage.
2. **Predictability:** An action should look and behave the same way across the entire application. A "Delete" button must always be destructive red and require confirmation.
3. **Graceful Degradation:** The application must be fully functional on a 320px mobile screen and beautifully expanded on a 4K monitor.
4. **Perceived Performance:** Smooth micro-interactions and skeleton loaders make the app _feel_ faster, even when waiting on database queries.

---

## 2. Tech Stack & Library Constraints

- **Styling Engine:** Tailwind CSS (Utility-first).
- **Component Library:** Shadcn UI (Owned components, NOT NPM dependencies).
- **Headless Accessibility:** Radix UI Primitives (Handles ARIA, focus traps, and keyboard navigation automatically).
- **Animations:** Framer Motion (For complex layout shifts) & Tailwind Transitions (For simple hovers).
- **Icons:** `lucide-react` (Consistent 24x24 stroke icons).

---

## 3. Component Taxonomy (The 3 Tiers)

As defined in the `quality-conventions.md`, components are strictly segregated by their level of "business awareness."

### 3.1 Base UI Components (`src/components/ui/`)

- **Rule:** These are "dumb" components. They know _nothing_ about the ERP.
- **Examples:** `<Button>`, `<Input>`, `<Dialog>`, `<Select>`.
- **Constraint:** Never import a Prisma model, Zod schema, or Server Action into this directory.

### 3.2 Domain Components (`src/components/[domain]/`)

- **Rule:** These are "smart" components. They accept specific ERP data types (e.g., `Order`, `Buyer`) and house complex business logic.
- **Examples:** `<OrderTable>`, `<InvoicePDFViewer>`, `<UploadLCModal>`.

### 3.3 Layout Components (`src/components/layout/`)

- **Rule:** These define the "shell" of the application.
- **Examples:** `<Sidebar>`, `<TopNavigation>`, `<PageHeader>`.

---

## 4. Responsive Design & Breakpoints

We strictly follow a **Mobile-First** approach. You write the default Tailwind classes for mobile screens, and use breakpoint prefixes (`md:`, `lg:`) to adjust for larger screens.

### 4.1 The Tailwind Breakpoint Scale

- **Base (Mobile):** `0px` - `639px` (Default classes, e.g., `flex-col`)
- **sm (Tablet Portrait):** `640px+`
- **md (Tablet Landscape / Small Laptop):** `768px+` (Use `md:flex-row`)
- **lg (Desktop):** `1024px+`
- **xl (Large Monitor):** `1280px+`

### 4.2 Handling Data Density on Mobile

Data tables are the hardest part of an ERP to make responsive.

- **Rule:** NEVER force horizontal scrolling on a primary data table on mobile unless absolutely necessary.
- **Standard:** Use a "Card Layout" fallback for mobile.

```tsx
// Example: Responsive Order List
<div className="hidden md:block">
  <OrderTable data={orders} /> {/* Renders full columns */}
</div>
<div className="grid grid-cols-1 gap-4 md:hidden">
  {orders.map(order => <OrderCardMobile key={order.id} data={order} />)}
</div>
```

### 4.3 Touch Targets & Ergonomics

- **Rule:** Any clickable element on a mobile device MUST have a minimum hit area of `44x44 pixels`.
- **Implementation:** Use padding (`p-2`, `p-3`) inside buttons and links to expand the hit area without necessarily making the visual element massive.

---

## 5. The 4 States of UI (Resilience)

A component is not finished until you have designed for all four states of data fetching.

1. **The Loading State (Skeletons):**
   - **Rule:** Never use a blank white screen. Never use a spinning wheel for a full page load.
   - **Standard:** Use the Shadcn `<Skeleton />` component to trace the exact shape of the data that is about to load. This prevents Layout Shift (CLS).

2. **The Empty State:**
   - **Rule:** A table with 0 rows should not just be blank.
   - **Standard:** Provide an illustration/icon, a helpful message ("No orders found for this month"), and a Call To Action ("+ Create New Order").

3. **The Error State:**
   - **Rule:** Catch errors at the component boundary (using Next.js `error.tsx`). Provide a clear, non-technical explanation and a "Try Again" button.

4. **The Ideal State:**
   - The happy path where data is fully loaded and interactive.

---

## 6. Accessibility (A11y) Mandates

The ERP must be usable by people navigating solely via keyboard or screen readers.

### 6.1 Keyboard Navigation & Focus

- **Rule:** Users must be able to `Tab` through every interactive element on the screen in a logical order.
- **Focus Rings:** Never remove the default focus outline (`outline-none`) without replacing it with a custom focus ring (`focus-visible:ring-2 focus-visible:ring-primary`).

### 6.2 ARIA Attributes

- Because we use Radix UI (via Shadcn), 90% of ARIA attributes (`aria-expanded`, `aria-hidden`, `role="dialog"`) are handled automatically.
- **Custom Overrides:** If building a custom toggle or interactive div, you MUST manually implement `role` and `aria-pressed`/`aria-checked`.

### 6.3 Color Contrast

- **Rule:** Text must have a minimum contrast ratio of `4.5:1` against its background. Do not use light gray text on a white background. Rely on the Tailwind `text-muted-foreground` variable, which is pre-calibrated.

---

## 7. Animation & Smooth UI (Micro-interactions)

Animations should guide the user's eye, not distract them.

### 7.1 Tailwind Transitions (Hovers & Toggles)

- **Rule:** All buttons, links, and interactive cards must have a hover state.
- **Standard:** Use `transition-colors duration-200` to fade between background/text colors smoothly.

```tsx
<button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">Submit</button>
```

### 7.2 Framer Motion (Layout Shifts)

- **Rule:** When an element enters or leaves the DOM (e.g., expanding a row, opening a modal, deleting a card), use Framer Motion `<AnimatePresence>` to prevent jarring snaps.

```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>;
```

### 7.3 Reduced Motion Compliance

- **Rule:** Respect the user's OS settings. Tailwind and Framer Motion must respect the `prefers-reduced-motion` media query. Omit bouncy or sliding animations if the user has this enabled.

---

## 8. Forms, Feedback, and Validation

### 8.1 Real-Time Feedback

- Forms must use `react-hook-form` intertwined with Zod.
- **Rule:** Validate on `onBlur` (when the user leaves the field) or `onSubmit`. Do not yell at the user with a red error while they are actively typing their first word.

### 8.2 Toast Notifications

- **Rule:** Every Server Action mutation (`create`, `update`, `delete`) must result in a Toast notification confirming success or explaining failure.
- **Standard:** Use `sonner` (the default Shadcn toast library).

### 8.3 Destructive Actions

- **Rule:** Actions like "Delete Order" or "Cancel LC" cannot be a single click. They MUST trigger an `AlertDialog` forcing the user to confirm the action.

---

## 9. Spacing & Typography

### 9.1 The 4-Point Grid

- **Rule:** All padding, margins, and gaps must align to the Tailwind 4-point scale (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-8` = 32px). Never use arbitrary spacing like `mt-[17px]`.

### 9.2 Typography Hierarchy

- **Font:** Inter (or similar highly legible sans-serif).
- **Headings:** Dark, high contrast (`text-foreground`), tight tracking (`tracking-tight`).
- **Body Text:** Optimal reading width (`max-w-prose`), comfortable line height (`leading-relaxed`).
- **Metadata/Timestamps:** Smaller, secondary color (`text-sm text-muted-foreground`).

---
