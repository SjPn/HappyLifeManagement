-- Push notifications (FCM device tokens + user preferences)
ALTER TABLE "User" ADD COLUMN "pushNotifyNewTickets" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "pushNotifyTicketStatus" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "pushNotifyNews" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "pushNotifyDebt" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "DevicePushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'android',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevicePushToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DevicePushToken_token_key" ON "DevicePushToken"("token");
CREATE INDEX "DevicePushToken_userId_idx" ON "DevicePushToken"("userId");

ALTER TABLE "DevicePushToken" ADD CONSTRAINT "DevicePushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
