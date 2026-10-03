-- CreateEnum
CREATE TYPE "EnquiryBudget" AS ENUM ('UNDER_5K', 'FROM_5K_TO_10K', 'FROM_10K_TO_25K', 'OVER_25K', 'NOT_SURE');

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "budget" "EnquiryBudget";
