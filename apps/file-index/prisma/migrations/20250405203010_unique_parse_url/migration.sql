/*
  Warnings:

  - A unique constraint covering the columns `[parseUrl]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parseUrl]` on the table `Show` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Movie_parseUrl_key" ON "Movie"("parseUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Show_parseUrl_key" ON "Show"("parseUrl");
