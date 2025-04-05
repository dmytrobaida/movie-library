import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SyncQueue } from './queues';

@Processor(SyncQueue)
export class SyncProcessor extends WorkerHost {
  async process(job: Job) {
    console.log('working on something!', job.name);

    await Promise.resolve();
  }
}
