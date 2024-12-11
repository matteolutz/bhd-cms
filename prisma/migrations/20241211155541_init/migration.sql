/*
  Warnings:

  - Added the required column `name` to the `ContentBlockBlueprint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContentBlockBlueprint" ADD COLUMN     "name" TEXT NOT NULL;
