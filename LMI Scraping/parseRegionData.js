const xlsx = require('xlsx');
const regions = new Set();
const dir = process.argv[2];
const path = './Excel_Sheets/regionLvl/' + dir + '/Occupational\ Employment\ Projections\ -\ Long\ Term.xlsx';
console.log(path);
var regionRows = [];

// Get the row numbers of the different regions
async function getRegionRows(){
    const workbook = await xlsx.readFile(path);
    const worksheet = await workbook.Sheets[workbook.SheetNames[0]];
    var range = xlsx.utils.decode_range(worksheet['!ref']);
    var i = 0;
    var region = null;
    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        const Area = worksheet[xlsx.utils.encode_cell({r: rowNum, c: 0})];
        if (i == 3) region = Area.v;
        if (region != null && Area.v != region){
            regionRows.push(i);
            region = Area.v;
        }
        i++;
    }

    //console.log(regionRows);
}

// Parse and write region-specific excel files
async function parseWrite(regionRows){
    var j = 2;
    var workbook = xlsx.readFile(path);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];

    var df = await xlsx.utils.sheet_to_json(worksheet);
 
    //console.log(regionRows);

    // Write .xlsx file for each region
    for (var i = 0; i < regionRows.length; i++){
       // console.log("start index: " + j);
        
        var temparray = await df.slice(j, regionRows[i]-1);
      
        //console.log(temparray[0]);

        var new_sheet = await xlsx.utils.json_to_sheet(temparray);
        var new_workbook = await xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(new_workbook, new_sheet, "test");
        await xlsx.writeFile(new_workbook, 'Excel_Sheets/regionLvl/' + dir + '/' + dir + '_region' + i + '.xlsx');

        //console.log(temparray[temparray.length-1]);
        j += temparray.length;
    }

}

async function runAll(){
    await getRegionRows();
    await parseWrite(regionRows);
    await console.log(regionRows);
}


runAll();
