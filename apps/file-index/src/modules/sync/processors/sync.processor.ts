import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { MediaService } from 'src/modules/shared/services/media.service';
import { SyncQueue } from 'src/modules/sync/types/queues';

@Processor(SyncQueue)
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private readonly mediaService: MediaService) {
    super();
  }

  async process() {
    try {
      this.logger.log('Start syncing media...');
      const { movies, shows } = await this.mediaService.syncAllMediaLists();
      this.logger.log(
        `End syncing media. Movies count: ${movies}. Shows count: ${shows}`,
      );
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      throw err;
    }
  }
}
