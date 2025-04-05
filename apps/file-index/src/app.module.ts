import { Module } from '@nestjs/common';
import { DirectoryModule } from './directory/directory.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [DirectoryModule, FileModule],
})
export class AppModule {}
