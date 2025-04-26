-- CreateTable
CREATE TABLE "HtmlFetch" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "result" TEXT NOT NULL,

    CONSTRAINT "HtmlFetch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HtmlFetch_url_key" ON "HtmlFetch"("url");
