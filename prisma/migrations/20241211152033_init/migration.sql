/*
  Warnings:

  - You are about to drop the column `contentBlockCategoryId` on the `ContentBlock` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `ContentBlock` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ContentBlock` table. All the data in the column will be lost.
  - You are about to drop the `ContentBlockCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contentBlockBlueprintId` to the `ContentBlock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContentBlock" DROP CONSTRAINT "ContentBlock_contentBlockCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "ContentBlock" DROP CONSTRAINT "ContentBlock_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ContentBlockCategory" DROP CONSTRAINT "ContentBlockCategory_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ContentBlockCategory" DROP CONSTRAINT "ContentBlockCategory_userId_fkey";

-- AlterTable
ALTER TABLE "ContentBlock" DROP COLUMN "contentBlockCategoryId",
DROP COLUMN "projectId",
DROP COLUMN "type",
ADD COLUMN     "contentBlockBlueprintId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ContentBlockCategory";

-- CreateTable
CREATE TABLE "ContentBlockBlueprint" (
    "id" TEXT NOT NULL,
    "type" "ContentBlockType" NOT NULL,
    "schema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ContentBlockBlueprint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentBlockBlueprint" ADD CONSTRAINT "ContentBlockBlueprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_contentBlockBlueprintId_fkey" FOREIGN KEY ("contentBlockBlueprintId") REFERENCES "ContentBlockBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
