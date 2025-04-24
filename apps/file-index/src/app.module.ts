import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexModule } from 'src/modules/index/index.module';
import { SharedModule } from 'src/modules/shared/shared.module';
import { StremioModule } from 'src/modules/stremio/stremio.module';
import { SyncModule } from 'src/modules/sync/sync.module';

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
