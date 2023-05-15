import { NextResponse } from 'next/server';
import {
  Browser,
  Page,
  PuppeteerWebBaseLoader,
} from 'langchain/document_loaders/web/puppeteer';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function POST(request: Request) {
  const { url } = await request.json();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 10,
  });

  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: { headless: true },
    gotoOptions: { waitUntil: 'domcontentloaded' },
    async evaluate(page: Page, browser: Browser) {
      const regex = new RegExp(/emrap.org\/corependium/);
      const match = regex.test(url);

      if (match) {
        await page.waitForSelector('.chapter__body', {
          visible: true,
        });

        const result = await page.evaluate(
          () => document.querySelector('.chapter__body')?.textContent ?? ''
        );
        return result;
      }

      return await page.evaluate(() => document.body.textContent ?? '');
    },
  });

  const docs = await loader.loadAndSplit(splitter);

  return NextResponse.json({ docs });
}
