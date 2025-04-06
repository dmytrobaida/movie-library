import { Module } from '@nestjs/common';
import { IndexController } from './index.controller';
import { IndexService } from './services/index.service';

@Module({
  imports: [],
  controllers: [IndexController],
  providers: [IndexService],
})
export class IndexModule {}
