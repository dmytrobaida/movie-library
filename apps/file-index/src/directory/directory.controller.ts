import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('d')
export class DirectoryController {
  constructor() {}

  @Get(['', '*path'])
  @Render('directory')
  directory(@Param('path') path: string) {
    return {
      directory: path,
      filesOrFolders: [
        {
          name: 'test',
          url: '/d/test',
        },
        {
          name: 'test2',
          url: '/d/test2',
        },
      ],
    };
  }
}
