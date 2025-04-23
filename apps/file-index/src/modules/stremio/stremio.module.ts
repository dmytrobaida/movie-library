import { Module } from '@nestjs/common';
import { StremioController } from './stremio.controller';

@Module({
  imports: [],
  controllers: [StremioController],
  providers: [],
})
export class StremioModule {}
