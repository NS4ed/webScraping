const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const { exit } = require('process');
//const getUrls = require('get-urls');
//const cors = require('cors')({origin: true});

const email_regex = /(?<=Email: ).*?(?=\s|Internet)/g;
const web_regex = /(?<=Internet: ).*?(?=\s)/g;
const phone_regex = /(?<=Phone: ).*?(?= Fax| Mobile)/g;
const fax_regex = /(?<=Fax: ).*?(?= Email)/g;

const file_path = process.argv[2];

var index = 1;
var dict = {};
var JSON_file;

async function scrapBLSHtml(url) {
// Gets html from given url
    const res = await fetch(url);
    const html = await res.text();

// Gets all BLS info
// NOTE: BLS info is under the 'bls' class     
    const $ = cheerio.load(html);
    const $$ = cheerio.load($('.bls').html());
    const bls = $('.bls');

// Gets each data field via regular expressions 
// ***See '<data>_regex' constants above***
    const emails = bls.text().match(email_regex);
    const urls = bls.text().match(web_regex);
    const phones = bls.text().match(phone_regex);
    const faxs = bls.text().match(fax_regex);

    const h4 = await bls.find('h4').map((_, element) => {
        var info = {
            ID: 0, Director: 0, Address: 0,
            Phone: 0, Fax: 0,
            Email: 0, URL: 0
        };

        // Object to hold all found paragraph tags
        const str_obj = $$('p').get(index);

        // Director name is at index 0
        info['Director'] = str_obj.children[0].data;

        // Address info varies across index 4, 6, 8, 10, and 12 (QA checks index/ID before storing address value)
        if (index == 3 || index == 9 || index == 17 || index == 29){
            info['Address'] = str_obj.children[4].data.trim() + " " + $$('p').get(index).children[6].data.trim();
        }
        else if (index == 32){
            info['Address'] = str_obj.children[10].data.trim() + " " + $$('p').get(index).children[12].data.trim();
        }
        else {
            info['Address'] = str_obj.children[6].data.trim() + " " + $$('p').get(index).children[8].data.trim();
        }

        // Stores remaining data fields
        info['ID'] = index-1;
        info['Phone'] = phones[index-1];
        info['Fax'] = faxs[index-1];
        info['Email'] = emails[index-1];
        info['URL'] = urls[index-1];

        // Stores data object into dictionary object
        dict[$(element).text()] = info;

        // Increments index/ID
        index++;
    });

    
    // (TEST PRINT) Prints dictionary object
    //console.log(dict);

    // Writes new json file
    JSON_file = JSON.stringify(dict);
    fs.writeFile(file_path, JSON_file, (err) => {
        if (err) console.log("Error: Cannot write to specified file: " + file_path + "\n");
        exit(1);
    });
}

scrapBLSHtml('https://www.bls.gov/bls/ofolist.htm');
