import {
  MediaBase,
  MovieDetails,
  ShowDetails,
} from 'src/modules/shared/types/media';

export interface ISync {
  getMediaByImdbId(imdbId: string): Promise<MediaBase | null>;
  getMoviesList(): Promise<MediaBase[]>;
  getMovieDetails(url: string): Promise<MovieDetails>;
  getShowsList(): Promise<MediaBase[]>;
  getShowDetails(url: string): Promise<ShowDetails>;
}
