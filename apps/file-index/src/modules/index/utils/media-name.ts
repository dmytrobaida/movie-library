import * as assert from 'assert';

type MediaName = { title: string; year: number };

export const getMediaName = (media: MediaName): string => {
  return `${media.title} (${media.year})`;
};

export const parseMediaName = (name: string): MediaName => {
  const match = name.match(/^(.*)\s\((\d{4})\)$/);
  assert(match, 'Invalid media name format!');
  const [, title, year] = match;

  return { title: title.trim(), year: parseInt(year, 10) };
};
