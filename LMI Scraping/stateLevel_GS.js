const cheerio = require('cheerio');
const pupp = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs');

const https = require('https');
const { pathToFileURL } = require('url');
const sslRootCAs = require('ssl-root-cas').create();
const sLLJson = require('./stateLevelLinks_GS.json');
const { exit } = require('process');
const { error } = require('console');
const { Stream } = require('stream');
sslRootCAs.inject();
https.globalAgent.options.ca = sslRootCAs;

//const getUrls = require('get-urls');
//const cors = require('cors')({origin: true});

// Redirect stderr to 'stderr.txt'/'failed.txt'
let redofile = fs.createWriteStream("failed.txt");
let errfile = fs.createWriteStream("stderr.txt"); 
process.stderr.write = function(data) {
    errfile.write(data);
};

// Traverses the JSON and scrap each link for state-level data
async function traverse(jsonObj){
    var j = 0;
    for (i in jsonObj){
        link = jsonObj[i]['link'];
        dir = i;
        
        console.log("Gathering state level data for", dir, "... ");
        if ((j + 1) % 2 == 0) await scrapBLSStateLvl(link, dir);
        else scrapBLSStateLvl(link, dir);
        j++;
    }

}

// Click an element on the page (retry if it fails)
async function click_xpath(page, xpath){
    try {
        var elements = await page.$x(xpath);
        await elements[0].click();
    } catch (error) {
        await click_xpath(page, xpath);
    }
    return;
}

// Scraps a given webpage for state-level data
async function scrapBLSStateLvl(url, state) {
    //const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4403.0 Safari/537.36';
    let browser = await pupp.launch({headless: false});
    var elements;
    
    var page = await browser.newPage();
    //await page.setUserAgent(userAgent);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setRequestInterception(true);
    //page.setDefaultTimeout(15000);

    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: './Excel_Sheets/'+state
      });

    page.on('request', (req) => {
      if(req.resourceType() == 'font' || req.resourceType() == 'image'){
          req.abort();
      }
      else {
          req.continue();
      }
  });

    page.on('dialog', async (dialog) => {
        await dialog.accept();
    });

    try {
    const response = await page.goto(url, {waitUntil: 'domcontentloaded'});

    // Click 'Filter'
    console.log("(" + state + ") Setting filter options for state-level data...");
    await page.waitFor('#filtersetIcon');
    await page.evaluate(()=>document.querySelector('#filtersetIcon').click()); 


    // Set 'Occupation Level' filter
    await page.waitFor(2000);
    await page.waitForXPath('//*[@id="ana_occ_level_list"]/div/button', {visible: true}); // Open Dropdown menu for Occ. Level
    await click_xpath(page, '//*[@id="ana_occ_level_list"]/div/button');
    

    await page.waitForXPath('//*[@id="ana_occ_level_list"]/div/div/div[2]/div/button[2]', {visible: true}); // Click on 'Deselect All'
    await click_xpath(page, '//*[@id="ana_occ_level_list"]/div/div/div[2]/div/button[2]');

    await page.waitForXPath('//*[@id="ana_occ_level_list"]/div/div/div[3]/ul/li[4]', {visible: true}); // Click on 'All Detailed Occ.'
    await click_xpath(page, '//*[@id="ana_occ_level_list"]/div/div/div[3]/ul/li[4]');


    await page.waitForXPath('//*[@id="ana_occ_level_list"]/div/button', {visible: true}); // Open Dropdown menu for Occ. Level
    await click_xpath(page, '//*[@id="ana_occ_level_list"]/div/button'); // Close Dropdown menu
    console.log("\t\t(" + state + ") Level Set");

    // Set 'Occupation Family' filter
    await page.waitFor(2000);
    await page.waitForXPath('//*[@id="ana_occ_family_list"]/div/button', {visible: true}); // Open Dropdown menu
    await click_xpath(page, '//*[@id="ana_occ_family_list"]/div/button');                 // for Occ. Family
 
    await page.waitForXPath('//*[@id="ana_occ_family_list"]/div/div/div[2]/div/button[1]');  // Click on
    await click_xpath(page, '//*[@id="ana_occ_family_list"]/div/div/div[2]/div/button[1]'); // 'Select All'

    await click_xpath(page, '//*[@id="ana_occ_family_list"]/div/button'); // Close Dropdown menu
    console.log("\t\t(" + state + ") Family Set");


    // Set 'Occupation' filter
    ret = await page.waitForXPath('//*[@id="ana_occ_codes_list"]/div/button', {visible: true}); // Open Dropdown menu
    //console.log(ret);                                                                           // for Occ. 
    await page.waitFor(2000);                                                                   // NOTE: * Automatic page refresh happens here *
    await click_xpath(page, '//*[@id="ana_occ_codes_list"]/div/button');                        // (wait 2 seconds)

    await page.waitForXPath('//*[@id="ana_occ_codes_list"]/div/div/div[2]/div/button[1]', {visible: true}); // Click on
    await click_xpath(page, '//*[@id="ana_occ_codes_list"]/div/div/div[2]/div/button[1]');                  // 'Select All'
                                                                                                            // NOTE: * Dialog box opens here *

    await click_xpath(page, '//*[@id="ana_occ_codes_list"]/div/button'); // Close Dropdown menu
    console.log("\t\t(" + state + ") OCCs Set");

    // Download Excel Sheet
    await page.waitFor(10000); 
    await page.waitForXPath('//*[@id="maintable_wrapper"]/div[4]/div[2]/div/button[3]', {visible: true}); // Download Excel
    await click_xpath(page, '//*[@id="maintable_wrapper"]/div[4]/div[2]/div/button[3]');  
    }
    // Write to 'failed.txt' if data collection fails
    catch (error){
        redofile.write(state, " - Failed to download state-level data\n");
        return;
    }
    console.log("\n(" + state + ") The state-level data for " + state + " has been collected. File downloaded to ./Excel_Sheets/" + state + "\n");

    await page.waitFor(5000); 
    
    browser.close();
}

// Traverse the JSON and scrap web pages
traverse(sLLJson);
