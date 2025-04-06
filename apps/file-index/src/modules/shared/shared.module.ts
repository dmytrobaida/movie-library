import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { UaserialsSyncService } from './services/uaserials-sync.service';
import { MediaService } from './services/media.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, UaserialsSyncService, MediaService],
  exports: [MediaService],
})
export class SharedModule {}
