-- CreateEnum
CREATE TYPE "DiscountUsageLimitType" AS ENUM ('unlimited', 'single_use_per_customer', 'total_redemption_cap');

-- CreateEnum
CREATE TYPE "DiscountValidityType" AS ENUM ('ongoing', 'fixed_duration', 'date_range');

-- CreateEnum
CREATE TYPE "DiscountStatus" AS ENUM ('scheduled', 'active', 'paused', 'ended');

-- CreateEnum
CREATE TYPE "DiscountStacking" AS ENUM ('allow', 'disallow');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('pending', 'shipped', 'delivered', 'cancelled', 'refunded');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "DiscountCode" ADD COLUMN     "autoIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "internalDescription" TEXT,
ADD COLUMN     "minimumOrderValueMinorUnits" INTEGER,
ADD COLUMN     "perCustomerLimit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "restrictedToEmail" TEXT,
ADD COLUMN     "stacking" "DiscountStacking" NOT NULL DEFAULT 'disallow',
ADD COLUMN     "startsAt" TIMESTAMP(3),
ADD COLUMN     "status" "DiscountStatus" NOT NULL DEFAULT 'active',
ADD COLUMN     "totalRedemptionCap" INTEGER,
ADD COLUMN     "usageLimitType" "DiscountUsageLimitType" NOT NULL DEFAULT 'unlimited',
ADD COLUMN     "validityType" "DiscountValidityType" NOT NULL DEFAULT 'ongoing';

-- CreateTable
CREATE TABLE "DiscountRedemption" (
    "id" TEXT NOT NULL,
    "discountCodeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "discountAmountMinorUnits" INTEGER NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelcomeSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "consentMarketing" BOOLEAN NOT NULL,
    "consentTimestamp" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "issuedCodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WelcomeSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountRedemption_orderId_key" ON "DiscountRedemption"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "WelcomeSubscriber_email_key" ON "WelcomeSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WelcomeSubscriber_issuedCodeId_key" ON "WelcomeSubscriber"("issuedCodeId");

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelcomeSubscriber" ADD CONSTRAINT "WelcomeSubscriber_issuedCodeId_fkey" FOREIGN KEY ("issuedCodeId") REFERENCES "DiscountCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

