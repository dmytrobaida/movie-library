import { Module } from '@nestjs/common';
import { DirectoryModule } from './directory/directory.module';
import { FileModule } from './file/file.module';
import { MediaModule } from './media/media.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DirectoryModule,
    FileModule,
    MediaModule,
  ],
})
export class AppModule {}
