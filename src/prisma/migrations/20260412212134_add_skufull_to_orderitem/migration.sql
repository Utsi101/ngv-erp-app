/*
  Warnings:

  - A unique constraint covering the columns `[skuFull]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `skuFull` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "skuFull" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_skuFull_key" ON "OrderItem"("skuFull");
