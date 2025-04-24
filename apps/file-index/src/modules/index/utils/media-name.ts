type MediaName = { title: string; metadata: { year: number } | null };

export const getMediaName = (media: MediaName): string => {
  return `${media.title} (${media.metadata?.year ?? '*'})`;
};
