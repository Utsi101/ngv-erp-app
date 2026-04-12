-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PROFORMA_SENT', 'ADVANCE_RECEIVED', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'SHIPPED', 'PAYMENT_REALIZED', 'REGULATORY_CLOSED');

-- CreateEnum
CREATE TYPE "Incoterm" AS ENUM ('EXW', 'FOB', 'CIF', 'DAP');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ADVANCE', 'BALANCE');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('SWIFT_COPY', 'SHIPPING_BILL', 'BL_COPY', 'CUSTOM_DESIGN', 'OTHER');

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "iecCode" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "lutNumber" TEXT,
    "llpin" TEXT,
    "adCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankBranch" TEXT NOT NULL,
    "bankAddress" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "swiftCode" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "billingAddress" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "taxId" TEXT,
    "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "skuBase" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hsCode" TEXT NOT NULL,
    "unitPriceUsd" DOUBLE PRECISION NOT NULL,
    "moq" INTEGER NOT NULL DEFAULT 1,
    "weightNet" DOUBLE PRECISION NOT NULL,
    "weightGross" DOUBLE PRECISION NOT NULL,
    "cbm" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "skuFull" TEXT NOT NULL,
    "color" TEXT,
    "leatherType" TEXT,
    "stockAllocation" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "buyerId" TEXT NOT NULL,
    "incoterm" "Incoterm" NOT NULL DEFAULT 'FOB',
    "portOfLoading" TEXT,
    "portOfDischarge" TEXT,
    "vesselName" TEXT,
    "awbBlNumber" TEXT,
    "shippingBillNumber" TEXT,
    "shippingBillDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "subTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freightCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lockedExchangeRate" DOUBLE PRECISION,
    "appliedLutNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "historicalUnitPrice" DOUBLE PRECISION NOT NULL,
    "historicalDescription" TEXT NOT NULL,
    "historicalHsCode" TEXT NOT NULL,
    "historicalNetWeight" DOUBLE PRECISION NOT NULL,
    "historicalGrossWeight" DOUBLE PRECISION NOT NULL,
    "historicalCbm" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLedger" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "referenceId" TEXT,
    "eBrcNumber" TEXT,
    "eBrcDate" TIMESTAMP(3),
    "bankFircNumber" TEXT,

    CONSTRAINT "PaymentLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAttachment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "s3ObjectKey" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_skuBase_key" ON "Product"("skuBase");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_skuFull_key" ON "ProductVariant"("skuFull");

-- CreateIndex
CREATE UNIQUE INDEX "Order_documentNumber_key" ON "Order"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAttachment_s3ObjectKey_key" ON "DocumentAttachment"("s3ObjectKey");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLedger" ADD CONSTRAINT "PaymentLedger_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAttachment" ADD CONSTRAINT "DocumentAttachment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
