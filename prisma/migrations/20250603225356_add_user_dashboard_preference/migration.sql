-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'EMAIL', 'NUMBER', 'PHONE', 'DATE', 'TIME', 'DATETIME', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'FILE', 'HEADING', 'PARAGRAPH', 'DIVIDER');

-- CreateEnum
CREATE TYPE "ReportFrequencyEnum" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('WELCOME', 'ADMIN_SETUP', 'ORGANIZATION_DETAILS', 'BRANCH_SETUP', 'BRANDING', 'USER_INVITATIONS', 'ROLE_CONFIGURATION', 'MEMBER_IMPORT', 'FINANCIAL_SETUP', 'MODULE_QUICK_START', 'COMPLETION');

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "successMessage" TEXT,
    "redirectUrl" TEXT,
    "enableCaptcha" BOOLEAN NOT NULL DEFAULT false,
    "notifyEmails" TEXT[],
    "branchId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "submissionCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "type" "FormFieldType" NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "helpText" TEXT,
    "defaultValue" TEXT,
    "options" JSONB,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "validations" JSONB,
    "order" INTEGER NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 100,
    "conditionalLogic" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "branchId" TEXT,
    "submittedById" TEXT,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormFieldValue" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "frequency" "ReportFrequencyEnum" NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "recipientEmails" TEXT[],
    "outputFormat" TEXT NOT NULL,
    "branchId" TEXT,
    "filterJson" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDashboardPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "dashboardType" TEXT NOT NULL,
    "layoutConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDashboardPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingProgress" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "completedSteps" "OnboardingStep"[],
    "currentStep" "OnboardingStep" NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "importedMembers" BOOLEAN NOT NULL DEFAULT false,
    "importedFinances" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Form_slug_key" ON "Form"("slug");

-- CreateIndex
CREATE INDEX "Form_branchId_idx" ON "Form"("branchId");

-- CreateIndex
CREATE INDEX "Form_status_idx" ON "Form"("status");

-- CreateIndex
CREATE INDEX "Form_createdAt_idx" ON "Form"("createdAt");

-- CreateIndex
CREATE INDEX "FormField_formId_idx" ON "FormField"("formId");

-- CreateIndex
CREATE INDEX "FormField_type_idx" ON "FormField"("type");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_idx" ON "FormSubmission"("formId");

-- CreateIndex
CREATE INDEX "FormSubmission_submittedAt_idx" ON "FormSubmission"("submittedAt");

-- CreateIndex
CREATE INDEX "FormSubmission_branchId_idx" ON "FormSubmission"("branchId");

-- CreateIndex
CREATE INDEX "FormFieldValue_submissionId_idx" ON "FormFieldValue"("submissionId");

-- CreateIndex
CREATE INDEX "FormFieldValue_fieldId_idx" ON "FormFieldValue"("fieldId");

-- CreateIndex
CREATE INDEX "ScheduledReport_branchId_idx" ON "ScheduledReport"("branchId");

-- CreateIndex
CREATE INDEX "ScheduledReport_createdById_idx" ON "ScheduledReport"("createdById");

-- CreateIndex
CREATE INDEX "ScheduledReport_frequency_idx" ON "ScheduledReport"("frequency");

-- CreateIndex
CREATE INDEX "ScheduledReport_nextRunAt_idx" ON "ScheduledReport"("nextRunAt");

-- CreateIndex
CREATE INDEX "UserDashboardPreference_userId_idx" ON "UserDashboardPreference"("userId");

-- CreateIndex
CREATE INDEX "UserDashboardPreference_branchId_idx" ON "UserDashboardPreference"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDashboardPreference_userId_branchId_dashboardType_key" ON "UserDashboardPreference"("userId", "branchId", "dashboardType");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProgress_branchId_key" ON "OnboardingProgress"("branchId");

-- CreateIndex
CREATE INDEX "OnboardingProgress_branchId_idx" ON "OnboardingProgress"("branchId");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormFieldValue" ADD CONSTRAINT "FormFieldValue_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormFieldValue" ADD CONSTRAINT "FormFieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "FormField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledReport" ADD CONSTRAINT "ScheduledReport_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledReport" ADD CONSTRAINT "ScheduledReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDashboardPreference" ADD CONSTRAINT "UserDashboardPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDashboardPreference" ADD CONSTRAINT "UserDashboardPreference_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
