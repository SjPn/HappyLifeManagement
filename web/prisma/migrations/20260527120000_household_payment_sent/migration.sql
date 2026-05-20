-- Track when chair sent payment amounts to residents
ALTER TABLE "HouseholdBilling" ADD COLUMN "paymentSentAt" TIMESTAMP(3);
