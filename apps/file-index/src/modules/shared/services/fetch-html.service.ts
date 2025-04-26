import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer-core';
import { PrismaService } from 'src/modules/shared/services/prisma.service';

@Injectable()
export class FetchHtmlService {
  private readonly logger = new Logger(FetchHtmlService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async fetchHtml(url: string, usePuppeteer: boolean = false): Promise<string> {
    const existingFetch = await this.prismaService.htmlFetch.findUnique({
      where: {
        url,
      },
    });

    if (existingFetch != null) {
      this.logger.log(`Found existing fetch for: ${url}`);
      return existingFetch.result;
    }

    this.logger.log(`Fetching: ${url}`);
    const html = await this.fetchHtmlHelper(url, usePuppeteer);
    await this.prismaService.htmlFetch.create({
      data: {
        url,
        result: html,
      },
    });

    this.logger.log(`Successfully fetched and saved result for: ${url}`);

    return html;
  }

  private async fetchHtmlHelper(url: string, usePuppeteer: boolean = false) {
    if (!usePuppeteer) {
      const html = await fetch(url).then((r) => r.text());
      return html;
    }

    const browser = await puppeteer.launch({
      headless: true,
      channel: 'chrome',
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(url);
    const html = await page.content();
    await browser.close();

    return html;
  }
}
