import { Controller, Get, Param, Render } from '@nestjs/common';
import { IndexService } from './services/index.service';
import { IndexPrefix } from 'src/modules/shared/types/prefixes';

@Controller(IndexPrefix)
export class IndexController {
  constructor(private readonly indexService: IndexService) {}

  @Get(['/{*path/}'])
  @Render('directory')
  async directory(@Param('path') path: string[] = []) {
    if (path.length > 0) {
      return {
        directory: 'final',
      };
    }
    return {
      directory: 'test',
      filesOrFolders: [
        {
          name: 'test',
          url: 'test/',
        },
      ],
    };
    // const directoryContents = await this.indexService.readDirectory(path);

    // return {
    //   directory: directoryContents.dirName,
    //   filesOrFolders: directoryContents.filesOrFolders,
    // };
  }

  @Get(['/{*path/}:fileName.strm'])
  strmFile(@Param('fileName') fileName: string) {
    return fileName;
  }
}
