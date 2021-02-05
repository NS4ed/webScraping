const cheerio = require('cheerio');
const getUrls = require('get-urls');
const fetch = require('node-fetch');
const cors = require('cors')({origin: true});

async function scrapRawHtml(url) {
    const res = await fetch(url);
    const html = await res.text();
   
    const $ = cheerio.load(html);
    const bls = $('.bls');
    const h4 = bls.find('h4:first').text();

    console.log(h4);
}

scrapRawHtml('https://www.bls.gov/bls/ofolist.htm');
