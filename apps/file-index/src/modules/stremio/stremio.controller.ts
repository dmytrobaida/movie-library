import { Controller, Get, Header, Logger, Param } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { MediaService } from 'src/modules/shared/services/media.service';
import { StremioPrefix } from 'src/modules/shared/types/prefixes';
import manifest from 'src/modules/stremio/manifest.json';

@Controller(StremioPrefix)
export class StremioController {
  private readonly logger = new Logger(StremioController.name);

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
  async catalog(@Param('type') type: string) {
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
    this.logger.log(`Fetching stremio stream for: ${id}`);

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

    if (type === 'series') {
      const { id: parsedId, season, episode } = this.parseComplexId(id);
      const show = isUUID(parsedId)
        ? await this.mediaService.getShowById(parsedId)
        : await this.mediaService.getShowByImdbId(parsedId);

      const showSeason = show?.seasons.find((s) => s.seasonNumber === season);
      const showEpisode = showSeason?.episodes.find(
        (e) => e.episodeNumber === episode,
      );

      const streams = showEpisode?.urls.map((u) => ({
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

  private parseComplexId(complexId: string) {
    const [id, season, episode] = complexId.split(':');

    return {
      id,
      season: Number(season),
      episode: Number(episode),
    };
  }
}
