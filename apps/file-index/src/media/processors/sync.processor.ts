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
      const movies = await this.uaserialsSyncService.getMoviesList();

      await this.prismaService.movie.createMany({
        data: movies,
        skipDuplicates: true,
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
