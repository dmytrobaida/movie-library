import { Injectable } from '@nestjs/common';
import * as assert from 'assert';
import { parse } from 'node-html-parser';
import { MediaBase } from '../types/media';

const baseUrl = 'https://uaserial.top';

@Injectable()
export class UaserialsSyncService {
  getMoviesList(): Promise<MediaBase[]> {
    return this.parsePaginated('/movie');
  }

  getShowsList(): Promise<MediaBase[]> {
    return this.parsePaginated('/serial');
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
}
