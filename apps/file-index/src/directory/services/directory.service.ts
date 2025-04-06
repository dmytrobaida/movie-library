import { Injectable } from '@nestjs/common';
import { DirectoryContents } from '../types/directory';
import { DirectoryPrefix } from 'src/shared/types/prefixes';
import { join } from 'path';
import { MediaService } from 'src/shared/services/media.service';
import * as assert from 'assert';

const MoviesFolderName = 'Movies';
const ShowsFolderName = 'Shows';

@Injectable()
export class DirectoryService {
  constructor(private readonly mediaService: MediaService) {}

  async readDirectory(path: string[]): Promise<DirectoryContents> {
    if (path.length === 0) {
      return {
        dirName: '/',
        filesOrFolders: [
          {
            name: MoviesFolderName,
            url: join(DirectoryPrefix, MoviesFolderName),
          },
          {
            name: ShowsFolderName,
            url: join(DirectoryPrefix, ShowsFolderName),
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
          name: this.getMediaFolderName(m),
          url: join(...path, m.id),
        })),
      };
    }

    const movieId = path.at(-1);
    assert(movieId, 'Id should be present!');
    const movie = await this.mediaService.getMovie(movieId);

    if (movie != null) {
      return {
        dirName: this.getMediaFolderName(movie),
        filesOrFolders: [],
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
          name: this.getMediaFolderName(m),
          url: join(...path, m.id),
        })),
      };
    }

    const showId = path.at(-1);
    assert(showId, 'Id should be present!');
    const show = await this.mediaService.getShow(showId);

    if (show != null) {
      return {
        dirName: this.getMediaFolderName(show),
        filesOrFolders: [],
      };
    }

    throw new Error('Not found!');
  }

  private getMediaFolderName(media: { title: string; year: number }): string {
    return `${media.title} (${media.year})`;
  }
}
