import { Module } from '@nestjs/common';
import { IndexController } from 'src/modules/index/index.controller';
import { IndexService } from 'src/modules/index/services/index.service';

@Module({
  imports: [],
  controllers: [IndexController],
  providers: [IndexService],
})
export class IndexModule {}
