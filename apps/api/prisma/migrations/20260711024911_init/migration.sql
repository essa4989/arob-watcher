-- CreateEnum
CREATE TYPE "Role" AS ENUM ('parent', 'nurse', 'doctor');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('pending', 'available', 'claimed');

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "role" "Role" NOT NULL,
    "pinHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("role")
);

-- CreateTable
CREATE TABLE "Session" (
    "token" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "device" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "CatheterLog" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "color" TEXT,
    "smell" TEXT,
    "pain" TEXT,
    "notes" TEXT,
    "device" TEXT,
    "createdByRole" "Role",

    CONSTRAINT "CatheterLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationLog" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "med" TEXT NOT NULL,
    "dose" TEXT,
    "method" TEXT,
    "response" TEXT,
    "notes" TEXT,
    "medScheduleId" TEXT,
    "device" TEXT,
    "createdByRole" "Role",

    CONSTRAINT "MedicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckLog" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temp" DOUBLE PRECISION,
    "bp" TEXT,
    "pulse" INTEGER,
    "spo2" INTEGER,
    "skin" TEXT,
    "consciousness" TEXT,
    "position" TEXT,
    "notes" TEXT,
    "device" TEXT,
    "createdByRole" "Role",

    CONSTRAINT "CheckLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FluidLog" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fluidType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "response" TEXT,
    "notes" TEXT,
    "device" TEXT,
    "createdByRole" "Role",

    CONSTRAINT "FluidLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareLog" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "care" TEXT NOT NULL,
    "response" TEXT,
    "notes" TEXT,
    "device" TEXT,
    "createdByRole" "Role",

    CONSTRAINT "CareLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedSchedule" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dose" TEXT,
    "method" TEXT,
    "times" JSONB NOT NULL,
    "frequency" TEXT,
    "days" JSONB NOT NULL,
    "startDate" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedGivenMark" (
    "id" TEXT NOT NULL,
    "medScheduleId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "givenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedGivenMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyLog" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "device" TEXT,
    "totalAtTime" INTEGER NOT NULL,

    CONSTRAINT "JourneyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "starsNeeded" INTEGER NOT NULL,
    "status" "RewardStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "achievedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "device" TEXT,
    "role" "Role",

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingsChangeLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setting" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "device" TEXT,

    CONSTRAINT "SettingsChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramChat" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "label" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TelegramChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatheterLog_childId_timestamp_idx" ON "CatheterLog"("childId", "timestamp");

-- CreateIndex
CREATE INDEX "MedicationLog_childId_timestamp_idx" ON "MedicationLog"("childId", "timestamp");

-- CreateIndex
CREATE INDEX "CheckLog_childId_timestamp_idx" ON "CheckLog"("childId", "timestamp");

-- CreateIndex
CREATE INDEX "FluidLog_childId_timestamp_idx" ON "FluidLog"("childId", "timestamp");

-- CreateIndex
CREATE INDEX "CareLog_childId_timestamp_idx" ON "CareLog"("childId", "timestamp");

-- CreateIndex
CREATE INDEX "MedSchedule_childId_idx" ON "MedSchedule"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "MedGivenMark_medScheduleId_date_time_key" ON "MedGivenMark"("medScheduleId", "date", "time");

-- CreateIndex
CREATE INDEX "JourneyLog_childId_timestamp_idx" ON "JourneyLog"("childId", "timestamp");

-- CreateIndex
CREATE INDEX "Reward_childId_idx" ON "Reward"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_childId_key_key" ON "AppSetting"("childId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramChat_chatId_key" ON "TelegramChat"("chatId");

-- AddForeignKey
ALTER TABLE "CatheterLog" ADD CONSTRAINT "CatheterLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationLog" ADD CONSTRAINT "MedicationLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckLog" ADD CONSTRAINT "CheckLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FluidLog" ADD CONSTRAINT "FluidLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareLog" ADD CONSTRAINT "CareLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedSchedule" ADD CONSTRAINT "MedSchedule_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedGivenMark" ADD CONSTRAINT "MedGivenMark_medScheduleId_fkey" FOREIGN KEY ("medScheduleId") REFERENCES "MedSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyLog" ADD CONSTRAINT "JourneyLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppSetting" ADD CONSTRAINT "AppSetting_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
