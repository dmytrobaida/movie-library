import { parse } from 'date-fns';
import { uk } from 'date-fns/locale';

export const parseUnformattedUkrainianDate = (dateStr: string): Date => {
  const formattedDate = dateStr
    .trim()
    .split('\n')
    .map((s) => s.trim())
    .join(' ');

  return parse(formattedDate, 'dd MMMM yyyy', new Date(), {
    locale: uk,
  });
};
