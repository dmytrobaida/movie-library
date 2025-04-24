import puppeteer from 'puppeteer-core';

export const getPageHtml = async (
  url: string,
  usePuppeteer: boolean = false,
): Promise<string> => {
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
};
