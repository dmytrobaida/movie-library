import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncProcessor } from './processors/sync.processor';
import { Queue } from 'bullmq';
import { UaserialsSyncService } from './services/uaserials-sync.service';
import { SyncQueue } from './types/queues';
import { PrismaService } from './services/prisma.service';

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
  providers: [SyncProcessor, UaserialsSyncService, PrismaService],
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
          // twice a day
          pattern: '0 */12 * * *',
          immediately: true,
        },
      },
    );
  }
}
