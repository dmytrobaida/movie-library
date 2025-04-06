/*
  Warnings:

  - You are about to drop the column `englishTitle` on the `MediaMetadata` table. All the data in the column will be lost.
  - Added the required column `originalTitle` to the `MediaMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MediaMetadata" DROP COLUMN "englishTitle",
ADD COLUMN     "originalTitle" TEXT NOT NULL;
