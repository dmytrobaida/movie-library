import assert from 'assert';
import { isURL } from 'class-validator';

export const parseAshdiPage = async (
  url: string,
): Promise<{ m3u8Url: string }> => {
  const fixedUrl = url.startsWith('//') ? `https://${url.slice(2)}` : url;
  assert(isURL(fixedUrl), 'Should be url!');

  const html = await fetch(fixedUrl).then((r) => r.text());
  const match = html.match(/https:\/\/ashdi\.vip\/.*?\.m3u8/);
  assert(match, 'Something went wrong when parsing m3u8 URL!');

  return { m3u8Url: match[0] };
};
