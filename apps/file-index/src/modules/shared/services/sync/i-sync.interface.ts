import { MediaBase, MovieDetails } from 'src/modules/shared/types/media';

export interface ISync {
  getMediaByImdbId(imdbId: string): Promise<MediaBase>;
  getMoviesList(): Promise<MediaBase[]>;
  getShowsList(): Promise<MediaBase[]>;
  getMovieDetails(url: string): Promise<MovieDetails>;
  // TODO: add getShowDetails method
}
