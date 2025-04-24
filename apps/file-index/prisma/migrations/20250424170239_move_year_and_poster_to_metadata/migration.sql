/*
  Warnings:

  - You are about to drop the column `poster` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `poster` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Show` table. All the data in the column will be lost.
  - Added the required column `posterUrl` to the `MediaMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `MediaMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MediaMetadata" ADD COLUMN     "posterUrl" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "poster",
DROP COLUMN "year";

-- AlterTable
ALTER TABLE "Show" DROP COLUMN "poster",
DROP COLUMN "year";
