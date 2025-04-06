import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UaserialsSyncService } from './uaserials-sync.service';

type SyncResults = {
  movies: number;
  shows: number;
};

@Injectable()
export class MediaService {
  constructor(
    private readonly uaserialsSyncService: UaserialsSyncService,
    private readonly prismaService: PrismaService,
  ) {}

  async syncAllMediaLists(): Promise<SyncResults> {
    const movies = await this.uaserialsSyncService.getMoviesList();
    await this.prismaService.movie.createMany({
      data: movies,
      skipDuplicates: true,
    });

    const shows = await this.uaserialsSyncService.getShowsList();
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
    return this.prismaService.movie.findMany();
  }

  async getMovie(id: string) {
    const movie = await this.prismaService.movie.findUnique({
      where: {
        id,
      },
      include: {
        metadata: true,
      },
    });

    if (movie == null) {
      return null;
    }

    if (movie.metadata == null) {
      const details = await this.uaserialsSyncService.getMovieDetails(
        movie.parseUrl,
      );
      const movieWithMetadata = await this.prismaService.movie.update({
        where: {
          id: movie.id,
        },
        data: {
          metadata: {
            create: details,
          },
        },
        include: {
          metadata: true,
        },
      });
      return movieWithMetadata;
    }

    return movie;
  }

  async getAllShows() {
    return this.prismaService.movie.findMany();
  }

  async getShow(id: string) {
    const show = await this.prismaService.show.findUnique({
      where: {
        id,
      },
      include: {
        metadata: true,
        episodes: true,
      },
    });
    return show;
  }
}
