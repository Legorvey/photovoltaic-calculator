const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForSelector('[data-orientation="horizontal"]', { timeout: 5000 }).catch(() => {});
  
  const sliderBounds = await page.evaluate(() => {
    const root = document.querySelector('[data-orientation="horizontal"]');
    if (!root) return null;
    const parent = root.parentElement;
    const track = root.querySelector('span:first-child');
    return {
      root: root.getBoundingClientRect(),
      parent: parent.getBoundingClientRect(),
      track: track.getBoundingClientRect(),
    };
  });
  console.log(JSON.stringify(sliderBounds, null, 2));
  await browser.close();
})();
