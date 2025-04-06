import { Controller, Get, Param } from '@nestjs/common';
import { FilePrefix } from 'src/shared/types/prefixes';

@Controller(FilePrefix)
export class FileController {
  constructor() {}

  @Get('*fileName.json')
  file(@Param('fileName') fileName: string) {
    return 'file: ' + fileName;
  }
}
