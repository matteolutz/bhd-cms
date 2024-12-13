/*
  Warnings:

  - You are about to drop the column `tag` on the `ContentBlock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContentBlock" DROP COLUMN "tag";

-- AlterTable
ALTER TABLE "ContentBlockBlueprint" ADD COLUMN     "tag" TEXT;
