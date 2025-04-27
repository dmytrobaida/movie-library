import { Controller, Get, Render } from '@nestjs/common';
import { LoggerPrefix } from 'src/modules/shared/types/prefixes';

@Controller(LoggerPrefix)
export class LoggerController {
  @Get()
  @Render('logger')
  logger() {
    return {};
  }
}
