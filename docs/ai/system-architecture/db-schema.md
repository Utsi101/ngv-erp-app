# Database Schema & Architecture

**Spoke Category:** System & Architecture
**Purpose:** Defines the core data models, relational mapping, naming conventions, and strict indexing rules for the Neon Postgres database using Prisma ORM.
**CRITICAL SYNC RULE:** Whenever a new model is added or an existing schema is modified in `prisma/schema.prisma`, you MUST immediately update this `db-schema.md` file to reflect the exact changes so it remains the infallible source of truth.

---

## 1. Core Philosophy & Industry Standards

The NGV-ERP-APP relies on a strictly relational PostgreSQL database.

- **Financial Precision (Decimal vs Float):** All currency, pricing, exchange rates, and critical weights MUST use `Decimal` (mapped to `@db.Decimal`). Standard `Float` is forbidden for financials due to IEEE 754 floating-point precision errors.
- **Primary Keys:** Always use String `cuid()` for IDs. They are time-sortable and reduce B-tree index fragmentation compared to standard UUIDs.
- **Soft Deletes vs. Hard Deletes:** Financial, shipping, and inventory records are **never hard-deleted**.
- **Decoupled Storage:** The database NEVER stores files. It strictly stores **S3 Metadata**.

---

## 2. Enums (State & Classification)

Use these Enums to maintain strict type safety across the database.

```prisma
enum OrderPhase {
  CONFIRMATION
  PRODUCTION
  LOGISTICS
  REALIZATION
}

enum Incoterm {
  EXW
  FOB
  CIF
  DAP
}

enum PaymentType {
  ADVANCE
  BALANCE
}

// Broad classification for UI filtering.
// Specific lifecycle routing is handled by docTag in OrderDocument.
enum FileCategory {
  FINANCIAL
  LOGISTICS
  CUSTOMS
  COMPLIANCE
  COMMUNICATION
  OTHER
}
```

---

## 3. Compliance & CRM (The Actors)

These models store the legally binding information required for Indian EXIM compliance (GST, IEC, AD Code) and international buyer tracking.

```prisma
model CompanyProfile {
  id            String   @id @default(cuid())

  // Identity & Location
  companyName   String
  addressLine1  String
  addressLine2  String?
  city          String
  district      String   // e.g., Kolkata
  state         String   // e.g., West Bengal
  stateCode     String   // e.g., 19
  pincode       String

  // Tax & Trade Licenses (Indian EXIM Compliance)
  gstin         String   // 15-digit
  iecCode       String   // 10-digit Importer Exporter Code
  pan           String
  lutNumber     String?  // Letter of Undertaking (for GST-free exports)
  llpin         String?

  // Banking (Remittance Info)
  adCode        String   // 14-digit Authorized Dealer Code
  bankName      String
  bankBranch    String
  bankAddress   String
  accountName   String
  accountNumber String
  swiftCode     String
  ifscCode      String

  // Contact
  email         String
  phone         String
  website       String?

  orders        Order[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("company_profiles")
}

model Buyer {
  id                String   @id @default(cuid())
  companyName       String
  contactPerson     String?
  email             String   @unique
  phone             String?
  billingAddress    String
  shippingAddress   String
  country           String
  taxId             String?
  preferredCurrency String   @default("USD")

  orders            Order[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("buyers")
}
```

---

## 4. Inventory & Catalog (Products)

A fully normalized inventory system supporting Base SKUs and Variants (Color/Leather Types).

```prisma
model Product {
  id            String           @id @default(cuid())
  skuBase       String           @unique
  description   String
  hsCode        String           // Harmonized System Code (Crucial for Customs)

  // Financial & Logistics Constraints
  unitPriceUsd  Decimal          @db.Decimal(10, 2)
  moq           Int              @default(1)
  weightNet     Decimal          @db.Decimal(10, 3) // in kg (e.g., 1.250)
  weightGross   Decimal          @db.Decimal(10, 3) // in kg
  cbm           Decimal          @db.Decimal(10, 4) // Cubic Meters

  variants      ProductVariant[]

  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@map("products")
}

model ProductVariant {
  id              String      @id @default(cuid())
  productId       String
  skuFull         String      @unique
  color           String?
  leatherType     String?
  stockAllocation Int         @default(0)

  product         Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  orderItems      OrderItem[]

  @@map("product_variants")
}
```

---

## 5. Orders & Financials (The Lifecycle Engine)

The central nervous system tracking the 4-Phase, 31-Step state machine, linked to line items and ledgers.

```prisma
model Order {
  id              String          @id @default(cuid())
  orderNumber     String          @unique // e.g., "ORD-2026-001" (Anchor for Invoices)

  // Foreign Keys
  buyerId         String
  companyId       String

  // 4-Phase Lifecycle Tracking
  currentPhase    OrderPhase      @default(CONFIRMATION)
  currentStepId   String          @default("1.1") // Active step in the 31-step cycle

  // Commercial Terms
  incoterm        Incoterm        @default(FOB)
  currency        String          @default("USD")
  totalAmount     Decimal         @db.Decimal(12, 2)

  // Mutable Logistics & Freight Data (Phase 3 updates)
  vesselName      String?
  containerNo     String?
  totalCartons    Int?
  portOfLoading   String?
  portOfDischarge String?

  // Timestamps
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relations
  buyer           Buyer           @relation(fields: [buyerId], references: [id], onDelete: Restrict)
  company         CompanyProfile  @relation(fields: [companyId], references: [id], onDelete: Restrict)
  items           OrderItem[]
  documents       OrderDocument[]
  ledgers         PaymentLedger[]

  @@index([buyerId])
  @@index([currentPhase])
  @@map("orders")
}

model OrderItem {
  id              String         @id @default(cuid())
  orderId         String
  variantId       String

  quantity        Int
  unitPrice       Decimal        @db.Decimal(10, 2) // Captured at time of order
  totalPrice      Decimal        @db.Decimal(12, 2)

  order           Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant         ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)

  @@map("order_items")
}

model PaymentLedger {
  id              String      @id @default(cuid())
  orderId         String

  amount          Decimal     @db.Decimal(12, 2)
  currency        String
  exchangeRate    Decimal     @db.Decimal(10, 4) // Exact INR conversion rate
  paymentType     PaymentType
  paymentDate     DateTime

  // FEMA & RBI Compliance Tracking
  referenceId     String?     // Wire transfer / Swift UTR #
  eBrcNumber      String?     // Electronic Bank Realization Certificate #
  eBrcDate        DateTime?
  bankFircNumber  String?     // Foreign Inward Remittance Certificate

  order           Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)

  createdAt       DateTime    @default(now())

  @@map("payment_ledgers")
}
```

---

## 6. Document Vault (S3 Metadata)

The unified model handling the "Manual S3 Gates" for the Order Lifecycle.

```prisma
model OrderDocument {
  id               String       @id @default(cuid())
  orderId          String

  // Lifecycle Identifier: e.g., "P1_S1.2", "P4_S4.3"
  docTag           String

  // UI-Friendly Standard Name: e.g., "Proforma_Invoice", "Bill_of_Lading"
  standardFileName String

  // Broad grouping for UI filters
  category         FileCategory @default(OTHER)

  // Exact S3 Path: "orders/ORD-2026-001/phase_1/P1_S1.2_my_invoice.pdf"
  s3ObjectKey      String       @unique

  // Original user filename
  fileName         String

  uploadedAt       DateTime     @default(now())

  order            Order        @relation(fields: [orderId], references: [id], onDelete: Cascade)

  // Compound index for rapid querying of specific documents in an order step
  @@index([orderId, docTag])
  @@map("order_documents")
}
```

---

## 7. Migration Protocol

When an AI assistant suggests a schema change:

1. **Sync Documentation:** Update this `db-schema.md` file immediately to reflect the new or modified models.
2. **Never alter existing standard columns** (like `docTag` or `currentPhase`) without explicit approval.
3. **Additions over Mutations:** Prefer adding new optional columns over modifying existing columns to prevent breaking changes in production.
4. After generating Prisma schema updates, always run:
   - `npx prisma format`
   - `npx prisma migrate dev --name <descriptive_name>`
   - `npx prisma generate`
