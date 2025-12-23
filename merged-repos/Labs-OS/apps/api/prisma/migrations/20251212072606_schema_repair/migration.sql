/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `totalShares` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `tradable` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `priceCents` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `shares` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `replacedBy` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `deviceName` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `ip` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AssetShare` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IdempotencyKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LedgerEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoginAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenRevocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssetShare" DROP CONSTRAINT "AssetShare_assetId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "LoginAttempt" DROP CONSTRAINT "LoginAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_listingId_fkey";

-- DropIndex
DROP INDEX "Listing_assetId_idx";

-- DropIndex
DROP INDEX "Listing_sellerId_idx";

-- DropIndex
DROP INDEX "Session_expiresAt_idx";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "createdAt",
DROP COLUMN "metadata",
DROP COLUMN "totalShares",
DROP COLUMN "tradable",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "createdAt",
DROP COLUMN "priceCents",
DROP COLUMN "shares",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "replacedBy";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "deviceName",
DROP COLUMN "expiresAt",
DROP COLUMN "ip",
DROP COLUMN "updatedAt",
DROP COLUMN "userAgent";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "status",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "AssetShare";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "IdempotencyKey";

-- DropTable
DROP TABLE "LedgerEntry";

-- DropTable
DROP TABLE "LoginAttempt";

-- DropTable
DROP TABLE "TokenRevocation";

-- DropTable
DROP TABLE "Trade";

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
