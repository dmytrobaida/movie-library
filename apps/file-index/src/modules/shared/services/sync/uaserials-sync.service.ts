import { Injectable } from '@nestjs/common';
import assert from 'assert';
import { isURL } from 'class-validator';
import { HTMLElement, parse } from 'node-html-parser';
import { ISync } from 'src/modules/shared/services/sync/i-sync.interface';
import {
  MediaBase,
  MediaUrlBase,
  MovieDetails,
  ShowDetails,
} from 'src/modules/shared/types/media';
import { parseAshdiPage } from 'src/modules/shared/utils/ashdi';
import { parseUnformattedUkrainianDate } from 'src/modules/shared/utils/date';
import { getPageHtml } from 'src/modules/shared/utils/html';

const baseUrl = 'https://uaserial.top';

@Injectable()
export class UaserialsSyncService implements ISync {
  getShowDetails(url: string): Promise<ShowDetails> {
    throw new Error('Method not implemented.', { cause: url });
  }

  getMediaByImdbId(): Promise<MediaBase> {
    throw new Error('Method not implemented.');
  }

  getMoviesList(): Promise<MediaBase[]> {
    return this.parsePaginated('/movie');
  }

  getShowsList(): Promise<MediaBase[]> {
    return this.parsePaginated('/serial');
  }

  async getMovieDetails(url: string): Promise<MovieDetails> {
    assert(isURL(url), 'Should be url!');

    const html = await getPageHtml(url);
    const root = parse(html);

    const posterUrl = root
      .querySelector('div.poster > img')
      ?.getAttribute('src');
    const description = root
      .querySelector('div.description > div.text')
      ?.text.trim();
    const originalTitle = root.querySelector(
      'div.header--title > div.original',
    )?.text;
    const releaseDate = root.querySelector(
      'div.movie-data-item--date > div.value',
    )?.text;
    const country = root.querySelector(
      'div.movie-data-item--country > div.value > a',
    )?.text;
    const urls = await this.parseUrlsFromHtml(root);

    assert(posterUrl, 'Something went wrong when parsing posterUrl!');
    assert(description, 'Something went wrong when parsing description!');
    assert(originalTitle, 'Something went wrong when parsing originalTitle!');
    assert(releaseDate, 'Something went wrong when parsing releaseDate!');
    assert(country, 'Something went wrong when parsing country!');
    assert(urls.length > 0, 'Something went wrong when parsing urls');

    const parsedReleaseDate = parseUnformattedUkrainianDate(releaseDate);

    return {
      year: parsedReleaseDate.getFullYear(),
      posterUrl: baseUrl + posterUrl,
      description,
      releaseDate: parsedReleaseDate,
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
      const html = await getPageHtml(baseUrl + nextUrl);
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
      const parseUrl = item
        .querySelector(`a[title='${title}']`)
        ?.getAttribute('href');

      assert(title, 'Something went wrong when parsing title!');
      assert(parseUrl, 'Something went wrong when parsing parseUrl!');

      pageMedia.push({
        title,
        parseUrl: baseUrl + parseUrl,
      });
    }

    return {
      media: pageMedia,
      nextPage,
    };
  }

  private async parseUrlsFromHtml(
    htmlRoot: HTMLElement,
  ): Promise<MediaUrlBase[]> {
    const embedLink = htmlRoot.querySelector('#embed')?.getAttribute('src');
    assert(embedLink, 'Something went wrong when parsing embedLink!');
    const embedHtml = await getPageHtml(baseUrl + embedLink);
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

      const { m3u8Url } = await parseAshdiPage(voiceUrl.url);
      urls.push({
        name: voiceUrl.name,
        url: m3u8Url,
      });
    }

    return urls;
  }
}
