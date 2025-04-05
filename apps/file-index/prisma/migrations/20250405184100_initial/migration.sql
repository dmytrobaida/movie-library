-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "poster" TEXT NOT NULL,
    "parseUrl" TEXT NOT NULL,
    "mediaMetadataId" TEXT,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "poster" TEXT NOT NULL,
    "parseUrl" TEXT NOT NULL,
    "mediaMetadataId" TEXT,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowEpisode" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "showId" TEXT,

    CONSTRAINT "ShowEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaMetadata" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "englishTitle" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "county" TEXT NOT NULL,

    CONSTRAINT "MediaMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaUrl" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "movieId" TEXT,
    "showEpisodeId" TEXT,

    CONSTRAINT "MediaUrl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_mediaMetadataId_fkey" FOREIGN KEY ("mediaMetadataId") REFERENCES "MediaMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_mediaMetadataId_fkey" FOREIGN KEY ("mediaMetadataId") REFERENCES "MediaMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowEpisode" ADD CONSTRAINT "ShowEpisode_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaUrl" ADD CONSTRAINT "MediaUrl_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaUrl" ADD CONSTRAINT "MediaUrl_showEpisodeId_fkey" FOREIGN KEY ("showEpisodeId") REFERENCES "ShowEpisode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
