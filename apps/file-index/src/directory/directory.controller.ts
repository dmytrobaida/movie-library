import { Controller, Get, Param, Render } from '@nestjs/common';
import { DirectoryService } from './services/directory.service';
import { DirectoryPrefix } from 'src/shared/types/prefixes';

@Controller(DirectoryPrefix)
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Get(['', '*path'])
  @Render('directory')
  async directory(@Param('path') path: string[] = []) {
    const directoryContents = await this.directoryService.readDirectory(path);

    return {
      directory: directoryContents.dirName,
      filesOrFolders: directoryContents.filesOrFolders,
    };
  }
}
