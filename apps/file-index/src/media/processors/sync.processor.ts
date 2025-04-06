import { Processor, WorkerHost } from '@nestjs/bullmq';
import { SyncQueue } from '../types/queues';
import { UaserialsSyncService } from '../services/uaserials-sync.service';
import { PrismaService } from '../services/prisma.service';

@Processor(SyncQueue)
export class SyncProcessor extends WorkerHost {
  constructor(
    private readonly uaserialsSyncService: UaserialsSyncService,
    private readonly prismaService: PrismaService,
  ) {
    super();
  }

  async process() {
    try {
      console.log('Start syncing movies');
      const movies = await this.uaserialsSyncService.getMoviesList();

      await this.prismaService.movie.createMany({
        data: movies,
        skipDuplicates: true,
      });

      console.log('End syncing movies:', movies.length);

      console.log('Start syncing shows');
      const shows = await this.uaserialsSyncService.getShowsList();

      await this.prismaService.show.createMany({
        data: shows,
        skipDuplicates: true,
      });

      console.log('End syncing shows:', shows.length);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
      throw err;
    }
  }
}
