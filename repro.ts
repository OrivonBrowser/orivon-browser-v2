import { chromium } from 'playwright';
import path from 'path';

async function run() {
  const browser = await chromium.launch({
    headless: true,
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`BROWSER PAGE ERROR: ${err.message}`);
  });

  try {
    // We are testing the web version for now to see if we can catch the error
    await page.goto('http://localhost:3000');

    console.log('Waiting for wallet generation...');
    await page.waitForTimeout(10000); // Wait 10 seconds

    const content = await page.content();
    if (content.includes('Setting up your wallet')) {
      console.log('STILL SHOWING SPINNER');
    } else {
      console.log('NOT SHOWING SPINNER');
    }

    await page.screenshot({ path: 'repro_screenshot.png' });
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
}

run();
