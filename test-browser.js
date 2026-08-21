const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`API response: ${response.url()} - ${response.status()}`);
    }
  });

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log("Page loaded. Checking UI state...");
  const text = await page.evaluate(() => document.body.innerText);
  console.log("Page contains 'Loading deployments...':", text.includes('Loading deployments...'));
  console.log("Page contains 'Showing 0 active deployments':", text.includes('Showing 0 active deployments'));
  
  await browser.close();
})();
