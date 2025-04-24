import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/shared/services/prisma.service';
import { SyncServiceFactory } from 'src/modules/shared/services/sync/sync-service.factory';

type SyncResults = {
  movies: number;
  shows: number;
};

@Injectable()
export class MediaService {
  constructor(
    private readonly syncServiceFactory: SyncServiceFactory,
    private readonly prismaService: PrismaService,
  ) {}

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

  async getAllMovies() {
    return this.prismaService.movie.findMany({
      orderBy: {
        title: 'asc',
      },
    });
  }

  async getMovieById(id: string) {
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
      console.info('Found cached movie info for', movie.id);
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

  async getAllShows() {
    return this.prismaService.show.findMany({
      orderBy: {
        title: 'asc',
      },
    });
  }

  async getShow(id: string) {
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
      return existingMovie;
    }

    const movieBase = await this.syncServiceFactory
      .getSyncService('uakino')
      .getMediaByImdbId(imdbId);

    const newMovie = await this.prismaService.movie.create({
      data: movieBase,
    });

    return this.getMovieById(newMovie.id);
  }
}
