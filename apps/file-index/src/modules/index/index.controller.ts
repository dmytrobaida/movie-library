import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Render,
} from '@nestjs/common';
import { IndexService } from './services/index.service';
import { IndexPrefix } from 'src/modules/shared/types/prefixes';
import { MediaService } from '../shared/services/media.service';

@Controller(IndexPrefix)
export class IndexController {
  constructor(
    private readonly indexService: IndexService,
    private readonly mediaService: MediaService,
  ) {}

  @Get('/{*path/}')
  @Render('directory')
  async directory(@Param('path') path: string[] = []) {
    const directoryContents = await this.indexService.readDirectory(path);

    return {
      directory: directoryContents.dirName,
      filesOrFolders: directoryContents.filesOrFolders,
    };
  }

  @Get('/{*path/}:mediaUrlId.strm')
  @Header('content-type', 'text/plain')
  async strmFile(@Param('mediaUrlId') mediaUrlId: string) {
    const mediaUrl = await this.mediaService.getMediaUrl(mediaUrlId);

    if (mediaUrl?.url == null) {
      throw new NotFoundException();
    }

    return mediaUrl?.url;
  }

  @Get('/{*path/}movie.nfo')
  @Header('content-type', 'text/xml')
  async metadataFile(@Param('path') path: string[] = []) {
    const movieId = path.at(-1);

    if (movieId == null) {
      throw new NotFoundException();
    }

    const movie = await this.mediaService.getMovie(movieId);

    if (movie == null || movie.metadata == null) {
      throw new NotFoundException();
    }

    // TODO: use some xml builder
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<movie>
  <title>${movie.title}</title>
  <originaltitle>${movie.metadata.originalTitle}</originaltitle>
  <year>${movie.year}</year>
</movie>`;
  }
}
