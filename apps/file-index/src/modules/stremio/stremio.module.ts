import { Module } from '@nestjs/common';
import { StremioController } from 'src/modules/stremio/stremio.controller';

@Module({
  imports: [],
  controllers: [StremioController],
  providers: [],
})
export class StremioModule {}
