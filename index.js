// 16/07/19
//npm init -- yes
//yarn add request request-promise cheerio
// or if we want to use npm:
//npm i --save request request-promise cheerio

const request = require("request-promise");
const cheerio = require("cheerio");
const ObjectsToCsv = require('objects-to-csv');

const url = "https://sfbay.craigslist.org/search/sof";


//template
const scrapeSample = {
    title: "software engeneer",
    description: "do nothing and just chill all day long",
    datePosted: new Date('2019-07-16'),
    url: "https://sfbay.craigslist.org/sfc/sof/d/san-francisco-ios-mobile-developer/6934990859.html",
    hood: "financial district",
    address: "101 Montgomery Street, Suite 350 near Sutter Street",
    compensation: "21$/hour"
}

const scrapeResults = [];

async function scrapeJobHeader(){
    try{
        //GET html
        const htmlResult = await request.get(url);
        //console.log(htmlResult);
        const $ = await cheerio.load(htmlResult);

        //get titles jobs and urls 
        $(".result-info").each((index, element) => {
            const resultTitle = $(element).children(".result-title");
            const title = resultTitle.text();
            const url =   resultTitle.attr("href");
            const datePosted = $(element).children("time").attr("datetime");
            const hood =  $(element).find(".result-hood").text();
            //console.log(title);

            const scrapeResult = {
                title,
                url,
                datePosted,
                hood
            }

            scrapeResults.push(scrapeResult);
        });

        return scrapeResults;
    }
    catch(err){
        console.log(err);
    }
}

async function scrapeDescription(jobsWithHeaders){
    return await Promise.all(jobsWithHeaders.map( async (job) => {
        try{
        //GET for each job
        const htmlResult = await request.get(job.url);
        const $ = cheerio.load(htmlResult);
        $(".print-qrcode-container").remove();
        job.description = $("#postingbody").text();
        job.address = $("div.mapaddress").text();
        const compensationText = $(".attrgroup").children().first().text();
        job.compensation = compensationText.replace("compensation: ","");
        return job;
        }
        catch(err){
            console.log(err);
        }
        })
    );
}

async function createcsvFile(data){
    const csv = new ObjectsToCsv(data);
 
    // Save to file:
    await csv.toDisk('./jobs_craiglist.csv');
}

async function scrapeCraigList(){
    const jobsWithHeaders = await scrapeJobHeader();
    const jobsFullData = await scrapeDescription(jobsWithHeaders);
    //console.log(jobsFullData[0]);
    await createcsvFile(jobsFullData);
}

scrapeCraigList();

//object to csv
// npm i objects-to-csv