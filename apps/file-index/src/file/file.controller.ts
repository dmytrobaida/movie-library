import { Controller, Get, Param } from '@nestjs/common';

@Controller('f')
export class FileController {
  constructor() {}

  @Get('*fileName.json')
  file(@Param('fileName') fileName: string) {
    return 'file: ' + fileName;
  }
}
