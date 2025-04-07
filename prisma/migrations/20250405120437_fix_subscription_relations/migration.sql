/*
  Warnings:

  - Made the column `endDate` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PaymentRequest" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "endDate" SET NOT NULL;
