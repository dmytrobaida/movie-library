import { Controller, Get, Header, Param } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { MediaService } from 'src/modules/shared/services/media.service';
import { StremioPrefix } from 'src/modules/shared/types/prefixes';
import manifest from 'src/modules/stremio/manifest.json';

@Controller(StremioPrefix)
export class StremioController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('manifest.json')
  @Header('content-type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Headers', '*')
  manifest() {
    return manifest;
  }

  @Get('catalog/:type/:id.json')
  @Header('content-type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Headers', '*')
  async catalog(
    @Param('type') type: string,
    // @Param('id') id: string
  ) {
    if (type === 'movie') {
      const movies = await this.mediaService.getAllMovies();
      const metas = movies.map((m) => ({
        id: m.id,
        type,
        name: m.title,
        poster: m.metadata?.posterUrl,
      }));

      return {
        metas,
      };
    }

    return {
      metas: [],
    };
  }

  @Get('stream/:type/:id.json')
  @Header('content-type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Headers', '*')
  async streams(@Param('type') type: string, @Param('id') id: string) {
    console.log('stremio', id);
    if (type === 'movie') {
      const movie = isUUID(id)
        ? await this.mediaService.getMovieById(id)
        : await this.mediaService.getMovieByImdbId(id);

      const streams = movie?.urls.map((u) => ({
        title: u.name,
        url: u.url,
      }));

      return {
        streams: streams ?? [],
      };
    }

    return {
      streams: [],
    };
  }
}
