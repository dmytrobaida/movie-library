/*
  Warnings:

  - You are about to drop the column `parseUrl` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `ShowEpisode` table. All the data in the column will be lost.
  - You are about to drop the column `season` on the `ShowEpisode` table. All the data in the column will be lost.
  - You are about to drop the column `showId` on the `ShowEpisode` table. All the data in the column will be lost.
  - Added the required column `episodeNumber` to the `ShowEpisode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShowEpisode" DROP CONSTRAINT "ShowEpisode_showId_fkey";

-- DropIndex
DROP INDEX "Show_parseUrl_key";

-- AlterTable
ALTER TABLE "Show" DROP COLUMN "parseUrl";

-- AlterTable
ALTER TABLE "ShowEpisode" DROP COLUMN "number",
DROP COLUMN "season",
DROP COLUMN "showId",
ADD COLUMN     "episodeNumber" INTEGER NOT NULL,
ADD COLUMN     "showSeasonId" TEXT;

-- CreateTable
CREATE TABLE "ShowSeason" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "parseUrl" TEXT NOT NULL,
    "showId" TEXT,

    CONSTRAINT "ShowSeason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShowSeason_parseUrl_key" ON "ShowSeason"("parseUrl");

-- AddForeignKey
ALTER TABLE "ShowSeason" ADD CONSTRAINT "ShowSeason_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowEpisode" ADD CONSTRAINT "ShowEpisode_showSeasonId_fkey" FOREIGN KEY ("showSeasonId") REFERENCES "ShowSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
