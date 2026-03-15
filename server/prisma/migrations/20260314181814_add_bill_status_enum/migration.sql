/*
  Warnings:

  - Added the required column `updatedAt` to the `Bill` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "status" "BillStatus" NOT NULL DEFAULT 'PROCESSING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
