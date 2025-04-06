import { Injectable } from '@nestjs/common';
import * as assert from 'assert';
import { parse, HTMLElement } from 'node-html-parser';
import { MediaBase, MediaUrlBase, MovieDetails } from '../types/media';
import { parseUnformattedUkrainianDate } from '../utils/date';

const baseUrl = 'https://uaserial.top';

@Injectable()
export class UaserialsSyncService {
  getMoviesList(): Promise<MediaBase[]> {
    return this.parsePaginated('/movie');
  }

  getShowsList(): Promise<MediaBase[]> {
    return this.parsePaginated('/serial');
  }

  async getMovieDetails(url: string): Promise<MovieDetails> {
    const html = await fetch(url).then((r) => r.text());
    const root = parse(html);

    const description = root.querySelector('div.description > div.text')?.text;
    const originalTitle = root.querySelector(
      'div.header--title > div.original',
    )?.text;
    const releaseDate = root.querySelector(
      'div.movie-data-item--date > div.value',
    )?.textContent;
    const country = root.querySelector(
      'div.movie-data-item--country > div.value > a',
    )?.text;
    const urls = await this.parseUrlsFromHtml(root);

    assert(description, 'Something went wrong when parsing description!');
    assert(originalTitle, 'Something went wrong when parsing originalTitle!');
    assert(releaseDate, 'Something went wrong when parsing releaseDate!');
    assert(country, 'Something went wrong when parsing country!');
    assert(urls.length > 0, 'Something went wrong when parsing urls');

    return {
      description,
      releaseDate: parseUnformattedUkrainianDate(releaseDate),
      originalTitle,
      country,
      urls,
    };
  }

  private async parsePaginated(startPage: string): Promise<MediaBase[]> {
    const allMedia: MediaBase[] = [];
    let nextUrl: string | undefined = startPage;
    let i = 0;

    while (nextUrl != null) {
      const html = await fetch(baseUrl + nextUrl).then((r) => r.text());
      const parseResult = this.parseHtmlPage(html);
      allMedia.push(...parseResult.media);
      nextUrl = parseResult.nextPage;

      // TODO: remove
      if (i++ === 1) {
        break;
      }
    }

    return allMedia;
  }

  private parseHtmlPage(html: string): {
    media: MediaBase[];
    nextPage?: string;
  } {
    const pageMedia: MediaBase[] = [];
    const root = parse(html);
    const gridItems = root.querySelectorAll('#filters-grid-content .item');
    const nextPage = root
      .querySelector('li.navigate.next > a')
      ?.getAttribute('href');

    for (const item of gridItems) {
      const title = item.querySelector('div.name')?.text;
      // TODO: remove default?
      const year = item.querySelector('a.info__item--year')?.text ?? '-1';
      const poster = item.querySelector('img.cover')?.getAttribute('src');
      const parseUrl = item
        .querySelector(`a[title='${title}']`)
        ?.getAttribute('href');

      assert(title, 'Something went wrong when parsing title!');
      assert(year, 'Something went wrong when parsing year!');
      assert(poster, 'Something went wrong when parsing poster!');
      assert(parseUrl, 'Something went wrong when parsing parseUrl!');

      pageMedia.push({
        title,
        year: Number(year),
        poster: baseUrl + poster,
        parseUrl: baseUrl + parseUrl,
      });
    }

    return {
      media: pageMedia,
      nextPage,
    };
  }

  private async parseAshdiPage(url: string): Promise<{ m3u8Url: string }> {
    const html = await fetch(url).then((r) => r.text());
    const match = html.match(/https:\/\/ashdi\.vip\/.*?\.m3u8/);
    assert(match, 'Something went wrong when parsing m3u8 URL!');

    return { m3u8Url: match[0] };
  }

  private async parseUrlsFromHtml(
    htmlRoot: HTMLElement,
  ): Promise<MediaUrlBase[]> {
    const embedLink = htmlRoot.querySelector('#embed')?.getAttribute('src');
    assert(embedLink, 'Something went wrong when parsing embedLink!');
    const embedHtml = await fetch(baseUrl + embedLink).then((r) => r.text());
    const embedRoot = parse(embedHtml);
    const voicesUrls = embedRoot
      .querySelectorAll('select.voices__select > option')
      .map((o) => ({
        name: o.text,
        url: o.getAttribute('value'),
      }));
    const urls: MediaUrlBase[] = [];

    for (const voiceUrl of voicesUrls) {
      if (!voiceUrl.url?.includes('ashdi')) {
        continue;
      }

      const { m3u8Url } = await this.parseAshdiPage(voiceUrl.url);
      urls.push({
        name: voiceUrl.name,
        url: m3u8Url,
      });
    }

    return urls;
  }
}
