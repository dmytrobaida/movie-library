/*
  Warnings:

  - A unique constraint covering the columns `[parseUrl]` on the table `Show` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `parseUrl` to the `Show` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "parseUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Show_parseUrl_key" ON "Show"("parseUrl");
