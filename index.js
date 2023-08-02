const functions = require('@google-cloud/functions-framework');
const puppeteer = require("puppeteer");
// const chromium = require("@sparticuz/chromium");


functions.http('getDiv', async (req, res) => {

  const { url, selector } = req.body;
  console.log(`Looking for ${selector} in ${url}`);

  let value = null;

  // Optional: If you'd like to use the legacy headless mode. "new" is the default.
  // chromium.setHeadlessMode = "new";

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

    // Return the value
    res.send(JSON.stringify({ value }));
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({
    //     value,
    //   })
    // }


  } catch (error) {
    await browser.close();

    console.log(error);
    res.send(JSON.stringify({ error: 'Failed' }));
    // return {
    //   statusCode: 500,
    //   body: JSON.stringify({ error: 'Failed' }),
    // }
  }


  res.send("done");
  //res.send(`Hello ${req.query.name || req.body.name || 'World'}!`);
});
