/*
  Warnings:

  - You are about to drop the column `county` on the `MediaMetadata` table. All the data in the column will be lost.
  - Added the required column `country` to the `MediaMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MediaMetadata" DROP COLUMN "county",
ADD COLUMN     "country" TEXT NOT NULL;
