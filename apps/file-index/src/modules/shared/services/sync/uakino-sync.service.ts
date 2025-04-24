import { Injectable } from '@nestjs/common';
import * as assert from 'assert';
import { isURL } from 'class-validator';
import { HTMLElement, parse } from 'node-html-parser';
import { ISync } from 'src/modules/shared/services/sync/i-sync.interface';
import {
  MediaBase,
  MediaUrlBase,
  MovieDetails,
} from 'src/modules/shared/types/media';
import { parseAshdiPage } from 'src/modules/shared/utils/ashdi';

const uakinoSearchUrl = 'https://uakino.me/';
const baseUrl = 'https://uakino.me/';

@Injectable()
export class UakinoSyncService implements ISync {
  async getMediaByImdbId(imdbId: string): Promise<MediaBase> {
    const html = await fetch(uakinoSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        do: 'search',
        subaction: 'search',
        story: imdbId,
      }),
    }).then((r) => r.text());
    const root = parse(html);

    const movieItems = root.querySelectorAll(
      'div#dle-content > div.movie-item',
    );
    const firstItem = movieItems.at(0);
    assert(firstItem, 'Media not found!');

    const title = firstItem.querySelector('a.movie-title')?.text.trim();
    const parseUrl = firstItem
      .querySelector('a.movie-title')
      ?.getAttribute('href');

    assert(title, 'Something went wrong when parsing title!');
    assert(parseUrl, 'Something went wrong when parsing parseUrl!');

    return {
      title,
      parseUrl,
    };
  }

  getMoviesList(): Promise<MediaBase[]> {
    throw new Error('Method not implemented.');
  }

  getShowsList(): Promise<MediaBase[]> {
    throw new Error('Method not implemented.');
  }

  async getMovieDetails(url: string): Promise<MovieDetails> {
    assert(isURL(url), 'Should be url!');

    const html = await fetch(url).then((r) => r.text());
    const root = parse(html);

    const posterUrl = root
      .querySelector('div.film-poster img')
      ?.getAttribute('src');
    const description = root
      .querySelector('div[itemprop="description"]')
      ?.text.trim();
    const originalTitle = root.querySelector('span.origintitle')?.text.trim();
    const urls = await this.parseUrlsFromHtml(root);

    assert(posterUrl, 'Something went wrong when parsing posterUrl!');
    assert(description, 'Something went wrong when parsing description!');
    assert(originalTitle, 'Something went wrong when parsing originalTitle!');
    assert(urls.length > 0, 'Something went wrong when parsing urls');

    const { releaseDate, country } =
      this.getReleaseDateAndCountryFromPage(root);

    return {
      year: releaseDate.getFullYear(),
      posterUrl: baseUrl + posterUrl,
      description,
      releaseDate,
      originalTitle,
      country,
      urls,
    };
  }

  private getReleaseDateAndCountryFromPage(htmlRoot: HTMLElement): {
    releaseDate: Date;
    country: string;
  } {
    let year: number | undefined;
    let country: string | undefined;

    const allInfoItems = htmlRoot.querySelectorAll('div.fi-item.clearfix');

    for (const infoItem of allInfoItems) {
      if (
        infoItem.querySelector('div.fi-label')?.text.trim() === 'Рік виходу:'
      ) {
        const yearText = infoItem.querySelector('div.fi-desc')?.text.trim();
        year = yearText != null ? Number(yearText) : undefined;
      }

      if (infoItem.querySelector('div.fi-label')?.text.trim() === 'Країна:') {
        const countryText = infoItem.querySelector('div.fi-desc')?.text.trim();
        country = countryText != null ? countryText.split(',')[0] : undefined;
      }
    }

    assert(year, 'Something went wrong when parsing year!');
    assert(country, 'Something went wrong when parsing country!');

    return {
      country,
      // setting 1 day of year because no such data
      releaseDate: new Date(year, 0, 1),
    };
  }

  private async parseUrlsFromHtml(
    htmlRoot: HTMLElement,
  ): Promise<MediaUrlBase[]> {
    const ashdiUrl = htmlRoot.querySelector('iframe#pre')?.getAttribute('src');

    assert(ashdiUrl, 'Something went wrong when parsing ashdiUrl!');

    const { m3u8Url } = await parseAshdiPage(ashdiUrl);

    return [
      {
        name: 'Uakino default',
        url: m3u8Url,
      },
    ];
  }
}
