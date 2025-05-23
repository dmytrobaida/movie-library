import { Global, Module } from '@nestjs/common';
import { FetchHtmlService } from 'src/modules/shared/services/fetch-html.service';
import { MediaService } from 'src/modules/shared/services/media.service';
import { PrismaService } from 'src/modules/shared/services/prisma.service';
import { RedisService } from 'src/modules/shared/services/redis.service';
import { SyncServiceFactory } from 'src/modules/shared/services/sync/sync-service.factory';
import { UakinoSyncService } from 'src/modules/shared/services/sync/uakino-sync.service';
import { UaserialsSyncService } from 'src/modules/shared/services/sync/uaserials-sync.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    UaserialsSyncService,
    UakinoSyncService,
    SyncServiceFactory,
    MediaService,
    FetchHtmlService,
    RedisService,
  ],
  exports: [MediaService, PrismaService, RedisService],
})
export class SharedModule {}
