const puppeteer = require('puppeteer');



async function samplePuperteer ()
{

    const options = {
        headless: true,
        ignoreHTTPSErrors: true,
    };
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.goto('https://feedback.mni.thm.de/');
    
    try
    {
        await page.$eval('#mat-input-0', el => el.value = 'gast01');
        await page.$eval('#mat-input-1', el => el.value = 'test123');
        await page.$eval('button', form => form.click());
        /*await page.keyboard.type('Hello World!');
        await page.keyboard.press('ArrowLeft');*/
        await page.screenshot({ path: 'example1.png', fullPage: true });

    } catch (e)
    {
        console.log("Test failed with reason: " + e)
    }


    await browser.close();
}

samplePuperteer().then()