import { Module } from '@nestjs/common';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import { AdminModule } from 'src/modules/admin/admin.module';
import { IndexModule } from 'src/modules/index/index.module';
import { LoggerModule } from 'src/modules/logger/logger.module';
import { SharedModule } from 'src/modules/shared/shared.module';
import { StremioModule } from 'src/modules/stremio/stremio.module';
import { SyncModule } from 'src/modules/sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    IndexModule,
    StremioModule,
    SharedModule,
    ConditionalModule.registerWhen(SyncModule, 'ENABLE_SYNC'),
    AdminModule,
    LoggerModule,
  ],
})
export class AppModule {}
