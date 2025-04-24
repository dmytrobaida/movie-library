import * as assert from 'assert';

export const parseAshdiPage = async (
  url: string,
): Promise<{ m3u8Url: string }> => {
  const html = await fetch(url).then((r) => r.text());
  const match = html.match(/https:\/\/ashdi\.vip\/.*?\.m3u8/);
  assert(match, 'Something went wrong when parsing m3u8 URL!');

  return { m3u8Url: match[0] };
};
