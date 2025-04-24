import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MediaService } from 'src/modules/shared/services/media.service';
import { SyncQueue } from 'src/modules/sync/types/queues';

@Processor(SyncQueue)
export class SyncProcessor extends WorkerHost {
  constructor(private readonly mediaService: MediaService) {
    super();
  }

  async process() {
    try {
      console.info('Start syncing media...');
      const { movies, shows } = await this.mediaService.syncAllMediaLists();
      console.info(
        `End syncing media. Movies count: ${movies}. Shows count: ${shows}`,
      );
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
      throw err;
    }
  }
}
