import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncProcessor } from './queues/sync.processor';
import { SyncQueue } from './queues/queues';
import { Queue } from 'bullmq';

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
export class MediaModule implements OnModuleInit {
  constructor(
    @InjectQueue(SyncQueue)
    private readonly syncQueue: Queue,
  ) {}

  onModuleInit() {
    void this.syncQueue.add(
      'sync',
      {},
      {
        repeat: {
          pattern: '* * * * *',
        },
      },
    );
  }
}
