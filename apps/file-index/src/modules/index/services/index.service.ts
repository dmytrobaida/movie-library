import { Injectable } from '@nestjs/common';
import { DirectoryContents } from '../types/directory';
import { MediaService } from 'src/modules/shared/services/media.service';
import * as assert from 'assert';
import { getMediaName, parseMediaName } from '../utils/media-name';

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

    throw new Error('Not found!');
  }

  private async readMovies(path: string[]): Promise<DirectoryContents> {
    if (path.at(-1) === MoviesFolderName) {
      const movies = await this.mediaService.getAllMovies();

      return {
        dirName: path.join('/'),
        filesOrFolders: movies.map((m) => ({
          name: getMediaName(m),
          url: `${getMediaName(m)}/`,
        })),
      };
    }

    const movieName = path.at(-1);

    assert(movieName, 'Movie name should be present!');
    const { title, year } = parseMediaName(movieName);
    const movieId = await this.mediaService.getMovieId(title, year);

    assert(movieId, 'Id should be present!');
    const movie = await this.mediaService.getMovie(movieId);

    if (movie != null) {
      return {
        dirName: getMediaName(movie),
        filesOrFolders: movie.urls.map((u) => ({
          name: `${getMediaName(movie)} - [${u.name}].strm`,
          url: `${movie.title}.strm`,
        })),
      };
    }

    throw new Error('Not found!');
  }

  private async readShows(path: string[]): Promise<DirectoryContents> {
    if (path.at(-1) === ShowsFolderName) {
      const shows = await this.mediaService.getAllShows();

      return {
        dirName: path.join('/'),
        filesOrFolders: shows.map((m) => ({
          name: getMediaName(m),
          url: `${m.id}/`,
        })),
      };
    }

    const showId = path.at(-1);
    assert(showId, 'Id should be present!');
    const show = await this.mediaService.getShow(showId);

    if (show != null) {
      return {
        dirName: getMediaName(show),
        filesOrFolders: [],
      };
    }

    throw new Error('Not found!');
  }
}
