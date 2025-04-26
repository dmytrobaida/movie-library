export type MediaBase = {
  title: string;
  parseUrl: string;
};

export type MediaUrlBase = { name: string; url: string };

type MediaDetails = {
  year: number;
  posterUrl: string;
  description: string;
  originalTitle: string;
  releaseDate: Date;
  country: string;
};

export type MovieDetails = MediaDetails & {
  urls: MediaUrlBase[];
};

export type ShowEpisode = {
  episodeNumber: number;
  urls: MediaUrlBase[];
};

export type ShowSeasonDetails = MediaDetails & {
  title: string;
  seasonNumber: number;
  parseUrl: string;
  episodes: ShowEpisode[];
};

export type ShowDetails = MediaDetails & {
  seasons: ShowSeasonDetails[];
};
