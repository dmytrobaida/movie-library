import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MediaMetadata } from '@prisma/client';
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
    const movie = await this.prismaService.movie.findUnique({
      where: {
        id,
      },
      include: {
        metadata: true,
        urls: true,
      },
    });

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

    return this.prismaService.movie.findUnique({
      where: {
        id,
      },
      include: {
        metadata: true,
        urls: true,
      },
    });
  }

  async getMovieByImdbId(imdbId: string) {
    const existingMovie = await this.prismaService.movie.findFirst({
      where: {
        metadata: {
          imdbId,
        },
      },
      include: {
        metadata: true,
        urls: true,
      },
    });

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

  async getShowById(id: string) {
    const show = await this.prismaService.show.findUnique({
      where: {
        id,
      },
      include: {
        metadata: true,
        episodes: {
          include: {
            urls: true,
          },
        },
      },
    });
    return show;
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
}
