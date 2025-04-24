import { MediaBase, MovieDetails } from 'src/modules/shared/types/media';

export interface ISync {
  getMoviesList(): Promise<MediaBase[]>;
  getShowsList(): Promise<MediaBase[]>;
  getMovieDetails(urlOrId: string): Promise<MovieDetails>;
}
