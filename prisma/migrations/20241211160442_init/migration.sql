/*
  Warnings:

  - Added the required column `name` to the `ContentBlock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContentBlock" ADD COLUMN     "name" TEXT NOT NULL;
