-- AlterTable
ALTER TABLE "ContentBlock" ADD COLUMN     "contentBlockCategoryId" TEXT;

-- CreateTable
CREATE TABLE "ContentBlockCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlockCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentBlockCategory" ADD CONSTRAINT "ContentBlockCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlockCategory" ADD CONSTRAINT "ContentBlockCategory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_contentBlockCategoryId_fkey" FOREIGN KEY ("contentBlockCategoryId") REFERENCES "ContentBlockCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
