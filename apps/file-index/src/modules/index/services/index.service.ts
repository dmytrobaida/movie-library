import { Injectable, NotFoundException } from '@nestjs/common';
import assert from 'assert';
import { DirectoryContents } from 'src/modules/index/types/directory';
import { getMediaName } from 'src/modules/index/utils/media-name';
import { MediaService } from 'src/modules/shared/services/media.service';

const MoviesFolderName = 'Movies';
const ShowsFolderName = 'Shows';

@Injectable()
export class IndexService {
  constructor(private readonly mediaService: MediaService) {}

  async readDirectory(path: string[]): Promise<DirectoryContents> {
    if (path.length === 0) {
      return {
        dirName: '/',
        filesOrFolders: [
          {
            name: MoviesFolderName,
            url: `${MoviesFolderName}/`,
          },
          {
            name: ShowsFolderName,
            url: `${ShowsFolderName}/`,
          },
        ],
      };
    }

    if (path.includes(MoviesFolderName)) {
      return this.readMovies(path);
    }

    if (path.includes(ShowsFolderName)) {
      return this.readShows(path);
    }

    throw new NotFoundException('Not found!');
  }

  private async readMovies(path: string[]): Promise<DirectoryContents> {
    if (path.length === 1) {
      const movies = await this.mediaService.getAllMovies();

      return {
        dirName: path.join('/'),
        filesOrFolders: movies.map((m) => ({
          name: getMediaName(m),
          url: `${m.id}/`,
          deleteUrl: `/i/delete/${m.id}`,
        })),
      };
    }

    const movieId = path.at(1);
    assert(movieId, new NotFoundException('Id should be present!'));
    const movie = await this.mediaService.getMovieById(movieId);
    assert(movie, new NotFoundException('Not found!'));

    return {
      mediaUrls: movie.urls,
      dirName: getMediaName(movie),
      filesOrFolders: movie.urls
        .map((u) => ({
          name: `${getMediaName(movie)} - [${u.name}].strm`,
          url: `${u.id}.strm`,
        }))
        .concat({
          name: 'movie.nfo',
          url: 'movie.nfo',
        }),
    };
  }

  private async readShows(path: string[]): Promise<DirectoryContents> {
    if (path.length === 1) {
      const shows = await this.mediaService.getAllShows();

      return {
        dirName: path.join('/'),
        filesOrFolders: shows.map((m) => ({
          name: getMediaName(m),
          url: `${m.id}/`,
          deleteUrl: `/i/delete/${m.id}`,
        })),
      };
    }

    const showId = path.at(1);
    assert(showId, new NotFoundException('Id should be present!'));
    const show = await this.mediaService.getShowById(showId);
    assert(show, new NotFoundException('Not found!'));

    if (path.length === 2) {
      return {
        dirName: getMediaName(show),
        filesOrFolders: show.seasons
          .map((s) => ({
            name: s.title,
            url: `${s.id}/`,
          }))
          .concat({
            name: 'show.nfo',
            url: 'show.nfo',
          }),
      };
    }

    const seasonId = path.at(2);
    const season = show.seasons.find((s) => s.id === seasonId);
    assert(season, new NotFoundException('Not found!'));

    if (path.length === 3) {
      return {
        dirName: season.title,
        filesOrFolders: season.episodes.map((e) => ({
          name: `${season.title} - ${e.episodeNumber}`,
          url: `${e.id}/`,
        })),
      };
    }

    const episodeId = path.at(3);
    const episode = season.episodes.find((e) => e.id === episodeId);
    assert(episode, new NotFoundException('Not found!'));

    if (path.length === 4) {
      return {
        mediaUrls: episode.urls,
        dirName: `${season.title} - ${episode.episodeNumber}`,
        filesOrFolders: episode.urls.map((u) => ({
          name: `${season.title} - ${episode.episodeNumber} - [${u.name}].strm`,
          url: `${u.id}.strm`,
        })),
      };
    }

    throw new NotFoundException('Not found!');
  }
}
