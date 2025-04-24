import { Injectable } from '@nestjs/common';
import { ISync } from 'src/modules/shared/services/sync/i-sync.interface';
import { MediaBase, MovieDetails } from 'src/modules/shared/types/media';

@Injectable()
export class UakinoSyncService implements ISync {
  getMediaByImdbId(imdbId: string): Promise<MediaBase> {
    console.log(imdbId);
    throw new Error('Method not implemented.');
  }

  getMoviesList(): Promise<MediaBase[]> {
    throw new Error('Method not implemented.');
  }

  getShowsList(): Promise<MediaBase[]> {
    throw new Error('Method not implemented.');
  }

  getMovieDetails(url: string): Promise<MovieDetails> {
    console.log(url);
    throw new Error('Method not implemented.');
  }
}
