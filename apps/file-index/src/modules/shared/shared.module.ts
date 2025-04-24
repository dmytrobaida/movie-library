import { Global, Module } from '@nestjs/common';
import { MediaService } from 'src/modules/shared/services/media.service';
import { PrismaService } from 'src/modules/shared/services/prisma.service';
import { UaserialsSyncService } from 'src/modules/shared/services/uaserials-sync.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, UaserialsSyncService, MediaService],
  exports: [MediaService],
})
export class SharedModule {}
