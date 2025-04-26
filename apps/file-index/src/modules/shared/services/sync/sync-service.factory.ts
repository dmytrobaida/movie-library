import { Injectable } from '@nestjs/common';
import { ISync } from 'src/modules/shared/services/sync/i-sync.interface';
import { UakinoSyncService } from 'src/modules/shared/services/sync/uakino-sync.service';
import { UaserialsSyncService } from 'src/modules/shared/services/sync/uaserials-sync.service';
import {
  MediaBase,
  MovieDetails,
  ShowDetails,
} from 'src/modules/shared/types/media';

@Injectable()
export class SyncServiceFactory implements ISync {
  constructor(
    private readonly uaserialsSyncService: UaserialsSyncService,
    private readonly uakinoSyncService: UakinoSyncService,
  ) {}

  getSyncService(name: 'uaserials' | 'uakino'): ISync {
    switch (name) {
      case 'uakino':
        return this.uakinoSyncService;
      case 'uaserials':
        return this.uaserialsSyncService;
    }
  }

  getMediaByImdbId(imdbId: string): Promise<MediaBase> {
    return this.uakinoSyncService.getMediaByImdbId(imdbId);
  }

  getMoviesList(): Promise<MediaBase[]> {
    return this.uaserialsSyncService.getMoviesList();
  }

  getShowsList(): Promise<MediaBase[]> {
    return this.uaserialsSyncService.getShowsList();
  }

  getMovieDetails(url: string): Promise<MovieDetails> {
    if (url.includes('uaserial')) {
      return this.uaserialsSyncService.getMovieDetails(url);
    }

    if (url.includes('uakino')) {
      return this.uakinoSyncService.getMovieDetails(url);
    }

    throw new Error('Wrong parse url!');
  }

  getShowDetails(url: string): Promise<ShowDetails> {
    if (url.includes('uaserial')) {
      return this.uaserialsSyncService.getShowDetails(url);
    }

    if (url.includes('uakino')) {
      return this.uakinoSyncService.getShowDetails(url);
    }

    throw new Error('Wrong parse url!');
  }
}
