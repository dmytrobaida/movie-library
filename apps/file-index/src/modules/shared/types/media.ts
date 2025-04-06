export type MediaBase = {
  title: string;
  year: number;
  poster: string;
  parseUrl: string;
};

export type MediaUrlBase = { name: string; url: string };

export type MovieDetails = {
  description: string;
  originalTitle: string;
  releaseDate: Date;
  country: string;
  urls: MediaUrlBase[];
};
