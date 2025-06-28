import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Render,
} from '@nestjs/common';
import assert from 'assert';
import { IndexService } from 'src/modules/index/services/index.service';
import { MediaService } from 'src/modules/shared/services/media.service';
import { IndexPrefix } from 'src/modules/shared/types/prefixes';

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
      mediaUrls: directoryContents.mediaUrls ?? [],
    };
  }

  @Get('/{*path/}:mediaUrlId.strm')
  @Header('content-type', 'text/plain')
  async strmFile(@Param('mediaUrlId') mediaUrlId: string) {
    const mediaUrl = await this.mediaService.getMediaUrl(mediaUrlId);
    assert(mediaUrl?.url, new NotFoundException());

    return mediaUrl?.url;
  }

  @Get('/delete/:id')
  async deleteById(@Param('id') id: string) {
    assert(id, new NotFoundException());
    await this.mediaService.geleteById(id);
    return `Successfully deleted movie or show with id: ${id}`;
  }

  @Get('/imdb/movie/:id')
  @Header('content-type', 'application/json')
  async imdbMovie(@Param('id') id: string) {
    const movie = await this.mediaService.getMovieByImdbId(id);
    return movie;
  }

  @Get('/imdb/show/:id')
  @Header('content-type', 'application/json')
  async imdbShow(@Param('id') id: string) {
    const show = await this.mediaService.getShowByImdbId(id);
    return show;
  }

  @Get('/{*path/}movie.nfo')
  @Header('content-type', 'text/xml')
  async movieNfo(@Param('path') path: string[] = []) {
    const movieId = path.at(-1);
    assert(movieId, new NotFoundException());

    const movie = await this.mediaService.getMovieById(movieId);
    assert(movie, new NotFoundException());
    assert(movie.metadata, new NotFoundException());

    // TODO: use some xml builder
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<movie>
  <title>${movie.title}</title>
  <originaltitle>${movie.metadata.originalTitle}</originaltitle>
  <year>${movie.metadata.year}</year>
  <description>${movie.metadata.description}</description>
  <imdb>${movie.metadata.imdbId}</imdb>
</movie>`;
  }

  @Get('/{*path/}show.nfo')
  @Header('content-type', 'text/xml')
  async showNfo(@Param('path') path: string[] = []) {
    const showId = path.at(-1);
    assert(showId, new NotFoundException());

    const show = await this.mediaService.getShowById(showId);
    assert(show, new NotFoundException());
    assert(show.metadata, new NotFoundException());

    // TODO: use some xml builder
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<show>
  <title>${show.title}</title>
  <originaltitle>${show.metadata.originalTitle}</originaltitle>
  <year>${show.metadata.year}</year>
  <description>${show.metadata.description}</description>
  <imdb>${show.metadata.imdbId}</imdb>
</show>`;
  }
}
