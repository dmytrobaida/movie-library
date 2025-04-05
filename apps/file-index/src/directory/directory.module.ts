import { Module } from '@nestjs/common';
import { DirectoryController } from './directory.controller';

@Module({
  imports: [],
  controllers: [DirectoryController],
  providers: [],
})
export class DirectoryModule {}
