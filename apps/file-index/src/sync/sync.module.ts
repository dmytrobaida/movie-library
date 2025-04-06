import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncProcessor } from './processors/sync.processor';
import { Queue } from 'bullmq';
import { SyncQueue } from './types/queues';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          connection: {
            url: configService.getOrThrow('REDIS_URL'),
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: SyncQueue,
    }),
  ],
  controllers: [],
  providers: [SyncProcessor],
})
export class SyncModule implements OnModuleInit {
  constructor(
    @InjectQueue(SyncQueue)
    private readonly syncQueue: Queue,
  ) {}

  onModuleInit() {
    // TODO: remove
    return;
    void this.syncQueue.add(
      'sync',
      {},
      {
        repeat: {
          // twice a day
          pattern: '0 */12 * * *',
          immediately: true,
        },
      },
    );
  }
}
