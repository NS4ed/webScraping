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
            Director: 0, Address: 0, ID: 0,
            Phone: 0, Fax: 0,
            Email: 0, URL: 0
        };
        // Director name is at index 0
        info['Director'] = $$('p').get(index).children[0].data;

        // Address info varies across index 4, 6, and 8 (needs QA check before storing address value)
        if (index == 3 || index == 9 || index == 17 || index == 29){
            info['Address'] = $$('p').get(index).children[4].data + $$('p').get(index).children[6].data
        }
        else if (index == 32){
            info['Address'] = $$('p').get(index).children[10].data + $$('p').get(index).children[12].data
        }
        else {
            info['Address'] = $$('p').get(index).children[6].data + $$('p').get(index).children[8].data
        }

        // Phone/Fax info varies (needs QA check before storing address value)
        switch(index){
            case 3: case 9: case 17: case 29:
                info['Phone'] = $$('p').get(index).children[8].data.substr(7, 15);
                info['Fax'] = $$('p').get(index).children[8].data.substr(27);
                break;
            case 8:
                info['Phone'] = $$('p').get(index).children[14].data.substr(7, 15);
                info['Fax'] = $$('p').get(index).children[14].data.substr(27);
                break;
            case 12: case 22: case 35: case 47: case 48: case 50:
                info['Phone'] = $$('p').get(index).children[12].data.substr(7, 15);
                info['Fax'] = $$('p').get(index).children[12].data.substr(27);
                break;
            case 32: case 43:
                info['Phone'] = $$('p').get(index).children[14].data.substr(7, 15);
                info['Fax'] = $$('p').get(index).children[14].data.substr(27);
                break;
            case 41: // Puerto Rico
                info['Phone'] = $$('p').get(index).children[14].data.substr(7, 15);
                info['Fax'] = $$('p').get(index).children[14].data.substr(27);
                break;
            default:
                info['Phone'] = $$('p').get(index).children[10].data.substr(7, 15);
                info['Fax'] = $$('p').get(index).children[10].data.substr(27);
                switch(index){
                    case 14:
                        info['Fax'] = $$('p').get(index).children[10].data.substr(35);
                        break;
                    case 20:
                        info['Fax'] = $$('p').get(index).children[10].data.substr(51);
                        break;
                    default:
                }
        }
        //NOTE: Fix phone data input for 'Peurto Rico'
        info['ID'] = index;
        dict[$(element).text()] = info;
        index++;
        
    });

    
    
    // (TEST PRINT) Prints dictionary object
    console.log(dict['LOUISIANA']);

    // (Test Print) Prints info for various states (via index)
    for (var i = 0; i < $$('p').get(50).children.length; i++){
       // console.log(i + $$('p').get(50).children[i].data);
    }
}

scrapHtml('https://www.bls.gov/bls/ofolist.htm');
