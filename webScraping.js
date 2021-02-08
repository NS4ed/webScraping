const cheerio = require('cheerio');
const getUrls = require('get-urls');
const fetch = require('node-fetch');
const cors = require('cors')({origin: true});

var index = 1;
var dict = {};
var adrs;
var adrs1;

async function scrapHtml(url) {
    const res = await fetch(url);
    const html = await res.text();
   
    const $ = cheerio.load(html);
    const $$ = cheerio.load($('.bls').html());
    const bls = $('.bls');
   
    const h4 = await bls.find('h4').map((_, element) => {
        var info = {
            Director: 0, Address: 0,
            Phone: 0, Fax: 0,
            Email: 0, URL: 0
        };
        // Director name is at index 0
        info['Director'] = $$('p').get(index).children[0].data;

        // Address info varies across index 4, 6, and 8 (needs QA check before storing address value)
        info['Address'] = $$('p').get(index).children[6].data + $$('p').get(index).children[8].data

       // info['Phone'] = $$('p').get(index).children[10].data.substr(0, 7);
        dict[$(element).text()] = info;
        index++;
        
    });

    // (Test Print) Prints info for various states (via index)
    for (var i = 0; i < $$('p').get(44).children.length; i++){
        console.log(i + $$('p').get(44).children[i].data);
    }
    
    // (TEST PRINT) Prints dictionary object
    console.log(dict);
}

scrapHtml('https://www.bls.gov/bls/ofolist.htm');
