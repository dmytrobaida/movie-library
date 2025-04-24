export type MediaBase = {
  title: string;
  parseUrl: string;
};

export type MediaUrlBase = { name: string; url: string };

export type MovieDetails = {
  year: number;
  posterUrl: string;
  description: string;
  originalTitle: string;
  releaseDate: Date;
  country: string;
  urls: MediaUrlBase[];
};
