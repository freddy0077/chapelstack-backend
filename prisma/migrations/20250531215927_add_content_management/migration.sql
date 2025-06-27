-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO_FILE', 'DOCUMENT_PDF', 'DOCUMENT_WORD', 'SLIDESHOW', 'OTHER');

-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContributionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "receiptNumber" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "contributionTypeId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "memberId" TEXT,
    "donorName" TEXT,
    "donorEmail" TEXT,
    "donorPhone" TEXT,
    "donorAddress" TEXT,
    "batchId" TEXT,
    "pledgeId" TEXT,
    "transactionId" TEXT,
    "transactionStatus" TEXT,
    "paymentGateway" TEXT,
    "branchId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "branchId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pledge" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "frequency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "memberId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "branchId" TEXT,
    "amountFulfilled" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "receiptNumber" TEXT,
    "invoiceNumber" TEXT,
    "expenseCategoryId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "vendorId" TEXT,
    "vendorName" TEXT,
    "vendorContact" TEXT,
    "branchId" TEXT,
    "budgetId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fiscalYear" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "fundId" TEXT NOT NULL,
    "ministryId" TEXT,
    "branchId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "budgetId" TEXT NOT NULL,
    "expenseCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sermon" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "datePreached" TIMESTAMP(3) NOT NULL,
    "speakerId" TEXT NOT NULL,
    "seriesId" TEXT,
    "mainScripture" TEXT,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "transcriptUrl" TEXT,
    "transcriptText" TEXT,
    "duration" INTEGER,
    "branchId" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sermon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Speaker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "memberId" TEXT,
    "branchId" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Speaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "artworkUrl" TEXT,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "type" "MediaType" NOT NULL,
    "branchId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SermonAttachments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SermonAttachments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Fund_branchId_idx" ON "Fund"("branchId");

-- CreateIndex
CREATE INDEX "ContributionType_branchId_idx" ON "ContributionType"("branchId");

-- CreateIndex
CREATE INDEX "PaymentMethod_branchId_idx" ON "PaymentMethod"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_transactionId_key" ON "Contribution"("transactionId");

-- CreateIndex
CREATE INDEX "Contribution_contributionTypeId_idx" ON "Contribution"("contributionTypeId");

-- CreateIndex
CREATE INDEX "Contribution_fundId_idx" ON "Contribution"("fundId");

-- CreateIndex
CREATE INDEX "Contribution_paymentMethodId_idx" ON "Contribution"("paymentMethodId");

-- CreateIndex
CREATE INDEX "Contribution_memberId_idx" ON "Contribution"("memberId");

-- CreateIndex
CREATE INDEX "Contribution_batchId_idx" ON "Contribution"("batchId");

-- CreateIndex
CREATE INDEX "Contribution_pledgeId_idx" ON "Contribution"("pledgeId");

-- CreateIndex
CREATE INDEX "Contribution_branchId_idx" ON "Contribution"("branchId");

-- CreateIndex
CREATE INDEX "Contribution_date_idx" ON "Contribution"("date");

-- CreateIndex
CREATE INDEX "Contribution_transactionId_idx" ON "Contribution"("transactionId");

-- CreateIndex
CREATE INDEX "Batch_branchId_idx" ON "Batch"("branchId");

-- CreateIndex
CREATE INDEX "Batch_date_idx" ON "Batch"("date");

-- CreateIndex
CREATE INDEX "Batch_status_idx" ON "Batch"("status");

-- CreateIndex
CREATE INDEX "Pledge_memberId_idx" ON "Pledge"("memberId");

-- CreateIndex
CREATE INDEX "Pledge_fundId_idx" ON "Pledge"("fundId");

-- CreateIndex
CREATE INDEX "Pledge_branchId_idx" ON "Pledge"("branchId");

-- CreateIndex
CREATE INDEX "Pledge_status_idx" ON "Pledge"("status");

-- CreateIndex
CREATE INDEX "Pledge_startDate_idx" ON "Pledge"("startDate");

-- CreateIndex
CREATE INDEX "Pledge_endDate_idx" ON "Pledge"("endDate");

-- CreateIndex
CREATE INDEX "ExpenseCategory_branchId_idx" ON "ExpenseCategory"("branchId");

-- CreateIndex
CREATE INDEX "ExpenseCategory_parentId_idx" ON "ExpenseCategory"("parentId");

-- CreateIndex
CREATE INDEX "Expense_expenseCategoryId_idx" ON "Expense"("expenseCategoryId");

-- CreateIndex
CREATE INDEX "Expense_fundId_idx" ON "Expense"("fundId");

-- CreateIndex
CREATE INDEX "Expense_paymentMethodId_idx" ON "Expense"("paymentMethodId");

-- CreateIndex
CREATE INDEX "Expense_vendorId_idx" ON "Expense"("vendorId");

-- CreateIndex
CREATE INDEX "Expense_branchId_idx" ON "Expense"("branchId");

-- CreateIndex
CREATE INDEX "Expense_budgetId_idx" ON "Expense"("budgetId");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Vendor_branchId_idx" ON "Vendor"("branchId");

-- CreateIndex
CREATE INDEX "Budget_fundId_idx" ON "Budget"("fundId");

-- CreateIndex
CREATE INDEX "Budget_ministryId_idx" ON "Budget"("ministryId");

-- CreateIndex
CREATE INDEX "Budget_branchId_idx" ON "Budget"("branchId");

-- CreateIndex
CREATE INDEX "Budget_fiscalYear_idx" ON "Budget"("fiscalYear");

-- CreateIndex
CREATE INDEX "Budget_status_idx" ON "Budget"("status");

-- CreateIndex
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetItem_expenseCategoryId_idx" ON "BudgetItem"("expenseCategoryId");

-- CreateIndex
CREATE INDEX "Sermon_branchId_idx" ON "Sermon"("branchId");

-- CreateIndex
CREATE INDEX "Sermon_speakerId_idx" ON "Sermon"("speakerId");

-- CreateIndex
CREATE INDEX "Sermon_seriesId_idx" ON "Sermon"("seriesId");

-- CreateIndex
CREATE INDEX "Sermon_status_idx" ON "Sermon"("status");

-- CreateIndex
CREATE INDEX "Sermon_datePreached_idx" ON "Sermon"("datePreached");

-- CreateIndex
CREATE UNIQUE INDEX "Speaker_memberId_key" ON "Speaker"("memberId");

-- CreateIndex
CREATE INDEX "Speaker_branchId_idx" ON "Speaker"("branchId");

-- CreateIndex
CREATE INDEX "Speaker_memberId_idx" ON "Speaker"("memberId");

-- CreateIndex
CREATE INDEX "Series_branchId_idx" ON "Series"("branchId");

-- CreateIndex
CREATE INDEX "MediaItem_branchId_idx" ON "MediaItem"("branchId");

-- CreateIndex
CREATE INDEX "MediaItem_type_idx" ON "MediaItem"("type");

-- CreateIndex
CREATE INDEX "_SermonAttachments_B_index" ON "_SermonAttachments"("B");

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionType" ADD CONSTRAINT "ContributionType_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_contributionTypeId_fkey" FOREIGN KEY ("contributionTypeId") REFERENCES "ContributionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_pledgeId_fkey" FOREIGN KEY ("pledgeId") REFERENCES "Pledge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_expenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_expenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryId") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Speaker" ADD CONSTRAINT "Speaker_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Speaker" ADD CONSTRAINT "Speaker_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaItem" ADD CONSTRAINT "MediaItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SermonAttachments" ADD CONSTRAINT "_SermonAttachments_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SermonAttachments" ADD CONSTRAINT "_SermonAttachments_B_fkey" FOREIGN KEY ("B") REFERENCES "Sermon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
