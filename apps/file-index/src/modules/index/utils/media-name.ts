type MediaName = { title: string; year: number };

export const getMediaName = (media: MediaName): string => {
  return `${media.title} (${media.year})`;
};
