import { Module } from '@nestjs/common';
import { DirectoryModule } from './directory/directory.module';
import { FileModule } from './file/file.module';
import { SyncModule } from './sync/sync.module';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DirectoryModule,
    FileModule,
    SyncModule,
    SharedModule,
  ],
})
export class AppModule {}
