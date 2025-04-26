import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import assert from 'assert';
import { isURL } from 'class-validator';
import { uniq } from 'lodash';
import { HTMLElement, parse } from 'node-html-parser';
import { FetchHtmlService } from 'src/modules/shared/services/fetch-html.service';
import { ISync } from 'src/modules/shared/services/sync/i-sync.interface';
import {
  MediaBase,
  MediaUrlBase,
  MovieDetails,
  ShowDetails,
  ShowEpisode,
  ShowSeasonDetails,
} from 'src/modules/shared/types/media';
import { parseAshdiPage } from 'src/modules/shared/utils/ashdi';

const uakinoSearchUrl = 'https://uakino.me/';
const baseUrl = 'https://uakino.me/';

@Injectable()
export class UakinoSyncService implements ISync {
  private readonly logger = new Logger(UakinoSyncService.name);

  constructor(private readonly fetchHtmlService: FetchHtmlService) {}

  async getMediaByImdbId(imdbId: string): Promise<MediaBase> {
    this.logger.log(`Getting media by imdb: ${imdbId}`);
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
    assert(firstItem, new NotFoundException('Media not found!'));

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
    this.logger.log(`Getting movie details: ${url}`);

    const html = await this.fetchHtmlService.fetchHtml(url, true);
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

  async getShowDetails(url: string): Promise<ShowDetails> {
    assert(isURL(url), 'Should be url!');
    this.logger.log(`Getting show details: ${url}`);

    const seasonDetails = await this.getShowSeason(url);
    const seasons: ShowSeasonDetails[] = [];

    for (const seasonUrl of seasonDetails.seasonsUrls) {
      seasons.push(await this.getShowSeason(seasonUrl));
    }

    return {
      originalTitle: seasonDetails.originalTitle,
      year: seasonDetails.year,
      posterUrl: seasonDetails.posterUrl,
      description: seasonDetails.description,
      releaseDate: seasonDetails.releaseDate,
      country: seasonDetails.country,
      seasons,
    };
  }

  async getShowSeason(
    url: string,
  ): Promise<ShowSeasonDetails & { seasonsUrls: string[] }> {
    assert(isURL(url), 'Should be url!');
    this.logger.log(`Getting show season details: ${url}`);

    const html = await this.fetchHtmlService.fetchHtml(url, true);
    const root = parse(html);

    const posterUrl = root
      .querySelector('div.film-poster img')
      ?.getAttribute('src');
    const description = root
      .querySelector('div[itemprop="description"]')
      ?.text.trim();
    const title = root.querySelector('span.solototle')?.text.trim();
    const originalTitle = root.querySelector('span.origintitle')?.text.trim();
    const seasons = root
      .querySelectorAll('ul.seasons a')
      .map((a) => a.getAttribute('href'))
      .filter((h) => h != null);

    assert(posterUrl, 'Something went wrong when parsing posterUrl!');
    assert(description, 'Something went wrong when parsing description!');
    assert(title, 'Something went wrong when parsing title!');
    assert(originalTitle, 'Something went wrong when parsing originalTitle!');
    assert(seasons.length > 0, 'Something went wrong when parsing seasons!');

    const seasonNumber = originalTitle.match(/(\d+)\s*season/i)?.[1];
    assert(seasonNumber, 'Something went wrong when parsing seasonNumber!');

    const { releaseDate, country } =
      this.getReleaseDateAndCountryFromPage(root);

    const episodes = await this.parseShowEpisodesFromHtml(root);
    assert(episodes.length > 0, 'Something went wrong when parsing episodes!');

    return {
      title,
      year: releaseDate.getFullYear(),
      posterUrl: baseUrl + posterUrl,
      parseUrl: url,
      seasonNumber: Number(seasonNumber),
      description,
      releaseDate,
      originalTitle,
      country,
      episodes,
      // needed because there is no info about current season
      seasonsUrls: uniq(seasons.concat(url).toSorted()),
    };
  }

  private getReleaseDateAndCountryFromPage(htmlRoot: HTMLElement): {
    releaseDate: Date;
    country: string;
  } {
    let year: number | undefined;
    let country: string | undefined;

    const allInfoItems = htmlRoot.querySelectorAll('div.clearfix');

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

  private async parseShowEpisodesFromHtml(
    htmlRoot: HTMLElement,
  ): Promise<ShowEpisode[]> {
    const episodes: ShowEpisode[] = [];
    const items = htmlRoot
      .querySelectorAll('div.playlists-videos > div.playlists-items li')
      .map((li) => ({
        name: li.getAttribute('data-voice'),
        ashdiUrl: li.getAttribute('data-file'),
        episodeNumber: li.text.match(/Серія\s*(\d+)/i)?.[1],
      }));

    const groupedItems: {
      [episodeNumber: string]: { name: string; url: string }[];
    } = {};

    for (const { ashdiUrl, name, episodeNumber } of items) {
      assert(ashdiUrl, 'Something went wrong when parsing ashdiUrl!');
      assert(name, 'Something went wrong when parsing name!');
      assert(episodeNumber, 'Something went wrong when parsing episodeNumber!');

      if (!ashdiUrl.includes('ashdi')) {
        continue;
      }

      const { m3u8Url } = await parseAshdiPage(ashdiUrl, this.fetchHtmlService);
      groupedItems[episodeNumber] = (groupedItems[episodeNumber] ?? []).concat({
        name,
        url: m3u8Url,
      });
    }

    for (const eNum in groupedItems) {
      episodes.push({
        episodeNumber: Number(eNum),
        urls: groupedItems[eNum],
      });
    }

    return episodes;
  }

  private async parseUrlsFromHtml(
    htmlRoot: HTMLElement,
  ): Promise<MediaUrlBase[]> {
    const ashdiUrl = htmlRoot.querySelector('iframe#pre')?.getAttribute('src');

    if (ashdiUrl != null) {
      const { m3u8Url } = await parseAshdiPage(ashdiUrl, this.fetchHtmlService);

      return [
        {
          name: 'Uakino (default)',
          url: m3u8Url,
        },
      ];
    }

    const urls: MediaUrlBase[] = [];
    const voicesLi = htmlRoot
      .querySelectorAll('div.playlists-videos li')
      .map((li) => ({
        name: li.getAttribute('data-voice'),
        ashdiUrl: li.getAttribute('data-file'),
      }));

    for (const { name, ashdiUrl } of voicesLi) {
      assert(ashdiUrl, 'Something went wrong when parsing ashdiUrl!');
      assert(name, 'Something went wrong when parsing name!');

      if (!ashdiUrl.includes('ashdi')) {
        continue;
      }

      const { m3u8Url } = await parseAshdiPage(ashdiUrl, this.fetchHtmlService);

      urls.push({
        name,
        url: m3u8Url,
      });
    }

    return urls;
  }
}
