const functions = require('@google-cloud/functions-framework');
const puppeteer = require("puppeteer");

functions.http('getDiv', async (req, res) => {
  return;

  const { url, selector } = req.body;
  console.log(`Looking for ${selector} in ${url}`);

  let value = null;

  // Launch the browser
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    
    // Go to url, block images and css
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if(req.resourceType() === 'image' || req.resourceType() === 'stylesheet'){
        req.abort();
      }
      else {
        req.continue();
      }
    });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    await page.waitForSelector(selector);
    value = await page.$eval(selector, el => el.innerText);
    await browser.close();

    // Print the value
    console.log(`Found ${value}`);

    // Return the value
    res.send(JSON.stringify({ value }));

  } catch (error) {
    await browser.close();

    console.log(error);
    res.send(JSON.stringify({ error: 'Failed' }));
  }
});
