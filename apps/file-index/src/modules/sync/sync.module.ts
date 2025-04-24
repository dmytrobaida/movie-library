import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncProcessor } from 'src/modules/sync/processors/sync.processor';
import { SyncQueue } from 'src/modules/sync/types/queues';

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
export class SyncModule {}
