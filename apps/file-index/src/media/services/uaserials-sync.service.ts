import { Injectable } from '@nestjs/common';
import * as assert from 'assert';
import { parse } from 'node-html-parser';
import { MovieBase } from '../types/media';

const baseUrl = 'https://uaserial.top';

@Injectable()
export class UaserialsSyncService {
  async getMoviesList(): Promise<MovieBase[]> {
    const movies: MovieBase[] = [];
    const html = await fetch(baseUrl + '/movie').then((r) => r.text());
    const root = parse(html);
    const movieCards = root.querySelectorAll('#filters-grid-content .item');

    for (const movieCard of movieCards) {
      const title = movieCard.querySelector('div.name')?.text;
      const year = movieCard.querySelector('a.info__item--year')?.text;
      const poster = movieCard.querySelector('img.cover')?.getAttribute('src');
      const parseUrl = movieCard
        .querySelector(`a[title='${title}']`)
        ?.getAttribute('href');

      assert(title, 'Something went wrong when parsing!');
      assert(year, 'Something went wrong when parsing!');
      assert(poster, 'Something went wrong when parsing!');
      assert(parseUrl, 'Something went wrong when parsing!');

      movies.push({
        title,
        year: Number(year),
        poster: baseUrl + poster,
        parseUrl: baseUrl + parseUrl,
      });
    }

    return movies;
  }
}
