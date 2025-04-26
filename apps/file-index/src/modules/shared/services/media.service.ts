import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MediaMetadata, ShowEpisode, ShowSeason } from '@prisma/client';
import { PrismaService } from 'src/modules/shared/services/prisma.service';
import { SyncServiceFactory } from 'src/modules/shared/services/sync/sync-service.factory';

type SyncResults = {
  movies: number;
  shows: number;
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly syncServiceFactory: SyncServiceFactory,
    private readonly prismaService: PrismaService,
  ) {}

  async getAllMovies() {
    return this.prismaService.movie.findMany({
      orderBy: {
        title: 'asc',
      },
      include: {
        metadata: true,
      },
    });
  }

  async getMovieById(
    id: string,
    partialMetadataToAdd?: Partial<MediaMetadata>,
  ) {
    const movie = await this.getDbMovieByIdOrImdbId({ movieId: id });

    if (movie == null) {
      return null;
    }

    if (movie.metadata != null && movie.urls.length > 0) {
      this.logger.log(`Found cached movie info for: ${movie.id}`);
      return movie;
    }

    const details = await this.syncServiceFactory.getMovieDetails(
      movie.parseUrl,
    );

    if (movie.metadata == null) {
      await this.prismaService.movie.update({
        where: {
          id: movie.id,
        },
        data: {
          metadata: {
            create: {
              ...partialMetadataToAdd,
              originalTitle: details.originalTitle,
              country: details.country,
              description: details.description,
              year: details.year,
              posterUrl: details.posterUrl,
              releaseDate: details.releaseDate,
            },
          },
        },
      });
    }

    if (movie.urls.length === 0) {
      await this.prismaService.movie.update({
        where: {
          id: movie.id,
        },
        data: {
          urls: {
            createMany: {
              data: details.urls,
            },
          },
        },
      });
    }

    return this.getDbMovieByIdOrImdbId({ movieId: id });
  }

  async getMovieByImdbId(imdbId: string) {
    const existingMovie = await this.getDbMovieByIdOrImdbId({ imdbId });

    if (existingMovie != null) {
      this.logger.log(`Found cached movie info for: ${existingMovie.id}`);
      return existingMovie;
    }

    const movieBase = await this.syncServiceFactory
      .getSyncService('uakino')
      .getMediaByImdbId(imdbId);

    if (movieBase == null) {
      throw new NotFoundException('Movie not found!');
    }

    const newMovie = await this.prismaService.movie.upsert({
      where: {
        parseUrl: movieBase.parseUrl,
      },
      create: movieBase,
      update: movieBase,
    });

    return this.getMovieById(newMovie.id, {
      imdbId,
    });
  }

  async getAllShows() {
    return this.prismaService.show.findMany({
      orderBy: {
        title: 'asc',
      },
      include: {
        metadata: true,
      },
    });
  }

  async getShowById(id: string, partialMetadataToAdd?: Partial<MediaMetadata>) {
    const show = await this.getDbShowByIdOrImdbId({ showId: id });

    if (show == null) {
      return null;
    }

    if (show.metadata != null && show.seasons.length > 0) {
      this.logger.log(`Found cached show info for: ${show.id}`);
      return show;
    }

    const details = await this.syncServiceFactory.getShowDetails(show.parseUrl);

    if (show.metadata == null) {
      await this.prismaService.show.update({
        where: {
          id: show.id,
        },
        data: {
          metadata: {
            create: {
              ...partialMetadataToAdd,
              year: details.year,
              posterUrl: details.posterUrl,
              originalTitle: details.originalTitle,
              description: details.description,
              releaseDate: details.releaseDate,
              country: details.country,
            },
          },
        },
      });
    }

    if (show.seasons.length === 0) {
      const createdSeasons = await this.prismaService.$transaction(
        async (tx) => {
          const seasons: ShowSeason[] = [];

          for (const s of details.seasons) {
            const createdEpisodes: ShowEpisode[] = [];

            for (const e of s.episodes) {
              const createdEpisode = await tx.showEpisode.create({
                data: {
                  episodeNumber: e.episodeNumber,
                  urls: {
                    createMany: {
                      data: e.urls,
                    },
                  },
                },
              });

              createdEpisodes.push(createdEpisode);
            }

            const createdSeason = await tx.showSeason.create({
              data: {
                title: s.title,
                seasonNumber: s.seasonNumber,
                parseUrl: s.parseUrl,
                episodes: {
                  connect: createdEpisodes,
                },
              },
            });

            seasons.push(createdSeason);
          }

          return seasons;
        },
      );

      await this.prismaService.show.update({
        where: {
          id: show.id,
        },
        data: {
          seasons: {
            connect: createdSeasons,
          },
        },
      });
    }

    return this.getDbShowByIdOrImdbId({ showId: id });
  }

  async getShowByImdbId(imdbId: string) {
    const existingShow = await this.getDbShowByIdOrImdbId({ imdbId });

    if (existingShow != null) {
      this.logger.log(`Found cached show info for: ${existingShow.id}`);
      return existingShow;
    }

    const showBase = await this.syncServiceFactory
      .getSyncService('uakino')
      .getMediaByImdbId(imdbId);

    if (showBase == null) {
      throw new NotFoundException('Show not found!');
    }

    const newShow = await this.prismaService.show.upsert({
      where: {
        parseUrl: showBase.parseUrl,
      },
      create: showBase,
      update: showBase,
    });

    return this.getShowById(newShow.id, {
      imdbId,
    });
  }

  async getMediaUrl(id: string) {
    return this.prismaService.mediaUrl.findUnique({
      where: {
        id,
      },
    });
  }

  async syncAllMediaLists(): Promise<SyncResults> {
    const movies = await this.syncServiceFactory.getMoviesList();
    await this.prismaService.movie.createMany({
      data: movies,
      skipDuplicates: true,
    });

    const shows = await this.syncServiceFactory.getShowsList();
    await this.prismaService.show.createMany({
      data: shows,
      skipDuplicates: true,
    });

    return {
      movies: movies.length,
      shows: shows.length,
    };
  }

  private getDbMovieByIdOrImdbId(data: { movieId?: string; imdbId?: string }) {
    return this.prismaService.movie.findFirst({
      where: {
        id: data.movieId,
        metadata:
          data.imdbId != null
            ? {
                imdbId: data.imdbId,
              }
            : undefined,
      },
      include: {
        metadata: true,
        urls: true,
      },
    });
  }

  private getDbShowByIdOrImdbId(data: { showId?: string; imdbId?: string }) {
    return this.prismaService.show.findFirst({
      where: {
        id: data.showId,
        metadata:
          data.imdbId != null
            ? {
                imdbId: data.imdbId,
              }
            : undefined,
      },
      include: {
        metadata: true,
        seasons: {
          orderBy: {
            title: 'asc',
          },
          include: {
            episodes: {
              include: {
                urls: true,
              },
            },
          },
        },
      },
    });
  }
}
