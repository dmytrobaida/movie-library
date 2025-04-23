import { Module } from '@nestjs/common';
import { IndexModule } from './modules/index/index.module';
import { SyncModule } from './modules/sync/sync.module';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './modules/shared/shared.module';
import { StremioModule } from './modules/stremio/stremio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    IndexModule,
    SyncModule,
    StremioModule,
    SharedModule,
  ],
})
export class AppModule {}
