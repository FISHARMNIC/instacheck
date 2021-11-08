//https://i.instagram.com/api/v1/friendships/44813038957/followers/?count=12&search_surface=follow_list_page
//Users/squijano/Library/Application Support/Chromium/Default/Cookies
const fs = require('fs');
const https = require('https');
const count = 1000;
const puppeteer = require('puppeteer');
const chrome = require('chrome-cookies-secure');

var userID;
var allDataGotten;
var allCookies;
var userName = "nicolas.quijano1"

//const URL = `https://i.instagram.com/api/v1/friendships/44813038957/followers/?count=${count}&search_surface=follow_list_page`
//HOW THIS IS DONE
/*
1. open instagram on my page
2. start recording network data
3. click "followers"
4. check the first request - [GET] followers
_____________
HOW IT WORKS
1. reads cookies for the correct keys
2. sends the request with proper keys
*/

getCookies();
//main();

function getCookies() {
    chrome.getCookies('https://www.instagram.com/nicolas.quijano1', function (err, cookies) {
        allCookies = cookies;
        allCookies.sessionid = allCookies.sessionid.replace(/%3A/g, ":")
        allCookies.shbid = allCookies.shbid.replace(/\\054/g, "\054")
        allCookies.shbts = allCookies.shbts.replace(/\\054/g, "\054")
        allCookies.rur = allCookies.rur.replace(/\\054/g, "\054")
        userID = allCookies.ds_user_id
        console.log(allCookies) //NOT GETTING ALL COOKIES NEEDED
        console.log("-> USERID ", userID)
        main()
    });
    //getUserID()
    //test2()
}

async function test2() {
    const browser = await puppeteer.launch();
    const [page] = await browser.pages();

    try {
        //https://www.instagram.com/web/search/topsearch/?query=nicolas.quijano1
        await page.goto(`https://www.instagram.com/nicolas.quijano1`, { waitUntil: 'networkidle0' });
        const cookies = await page.cookies()
        //console.log(cookies)
        //console.log(await page._client.send('Network.getAllCookies'));


        await browser.close();
    } catch (err) {
        console.error(err);
    }
}


async function getUserID() {
    const browser = await puppeteer.launch();
    const [page] = await browser.pages();

    try {
        //https://www.instagram.com/web/search/topsearch/?query=nicolas.quijano1
        await page.goto(`https://www.instagram.com/web/search/topsearch/?query=${userName}`, { waitUntil: 'networkidle0' });
        const data = await page.evaluate(() => document.querySelector('pre').innerHTML);

        //console.log(data)
        userID = JSON.parse(data).users[0].user.pk;
        console.log("-> USERID " + userID);

        await browser.close();
    } catch (err) {
        console.error(err);
    }
}

async function main() {
    //await getUserID();
    //ig_did=76B848CC-9812-403C-AB27-4F5AEC61769C; ig_nrcb=1; mid=YHNjAgAEAAEMDQKTNqV2W7Tx6iir; csrftoken=4Q3DdH1Byl51nrpxg2xSYyTQjpaStT8t; sessionid=' + userID + ':sX67MvQstlm1Hu:27; shbid="6754\054' + userID + '\0541667616095:01f7206b44f02433cfb7bdb43b79acf05a252113998e4058068e81d036881dbfa5f48495"; shbts="1636080095\054' + userID + '\0541667616095:01f72a3ba6d6793368077ed6f63f19f522147cc0ae399bf44bd0beb84ed086fae8485cfc"; ds_user_id=' + userID + '; rur="ATN\054' + userID + '\0541667616879:01f7f8dc92bf47da6223b870f412456f8e1320d249da2d650ac1f0daf4de433982e5c045"
    //var cookie = 'ig_did=' + allCookies.ig_did + '; ig_nrcb=' + allCookies.ig_nrcb + '; mid=YHNjAgAEAAEMDQKTNqV2W7Tx6iir; csrftoken=' + allCookies.csrftoken + '; sessionid=' + allCookies.sessionid + '; shbid="6754\054' + userID + '\0541667616095:01f7206b44f02433cfb7bdb43b79acf05a252113998e4058068e81d036881dbfa5f48495"; shbts="1636080095\054' + userID + '\0541667616095:01f72a3ba6d6793368077ed6f63f19f522147cc0ae399bf44bd0beb84ed086fae8485cfc"; ds_user_id=' + userID + '; rur="ATN\054' + userID + '\0541667616879:01f7f8dc92bf47da6223b870f412456f8e1320d249da2d650ac1f0daf4de433982e5c045"'
    var cookie = 'ig_did=' + allCookies.ig_did + '; ig_nrcb=' + allCookies.ig_nrcb + '; mid=YHNjAgAEAAEMDQKTNqV2W7Tx6iir; csrftoken=' + allCookies.csrftoken + '; sessionid=' + allCookies.sessionid + '; shbid="'+ allCookies.shbid + '"; shbts="'+ allCookies.shbts + '"; ds_user_id=' + allCookies.ds_user_id + '; rur="'+ allCookies.rur + '"'
    //var cookie = 'sessionid=' + userID + ':sX67MvQstlm1Hu:27; shbid="6754\054' + userID + '\0541667616095:01f7206b44f02433cfb7bdb43b79acf05a252113998e4058068e81d036881dbfa5f48495"; shbts="1636080095\054' + userID + '\0541667616095:01f72a3ba6d6793368077ed6f63f19f522147cc0ae399bf44bd0beb84ed086fae8485cfc"; ds_user_id=' + userID + '; rur="ATN\054' + userID + '\0541667616879:01f7f8dc92bf47da6223b870f412456f8e1320d249da2d650ac1f0daf4de433982e5c045"'
    const options = {
        hostname: "i.instagram.com",
        path: `/api/v1/friendships/${userID}/followers/?count=${count}&search_surface=follow_list_page`,
        headers: {
            "x-asbd-id": '198387',
            //"x-ig-www-claim": "hmac.AR1wU1Ayk2-8NAGhtzAa6JqYXxz_p7TKC_uTn75wmJmEPUI6",
            "x-ig-app-id": '936619743392459',
            cookie: cookie,
            //'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4286.0 Safari/537.3'
        }
    }

    https.get(options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            fs.writeFileSync("out.json", data);
            //console.log(data)
            gotData();
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}


function gotData() {
    //console.log(fs.readFileSync("out.json"))
    try {
        allDataGotten = JSON.parse(fs.readFileSync("out.json"));
        //console.log(JSON.stringify(allDataGotten), JSON.stringify(allDataGotten).includes('"message":"useragent mismatch","status":"fail"'))
        if((allDataGotten == undefined) || (JSON.stringify(allDataGotten).includes('"message":"useragent mismatch","status":"fail"'))) {
            console.log("unsuccessful - incorrect keys");
            process.exit(1);
        }
        console.log("-> Successful followers");
    } catch (e) {
        console.log("unsuccessful - got html");
        process.exit(1);
    }

    var users = allDataGotten.users;

    //console.log(users)

    //for (i = 0; i < users.length; i++) {
        //console.log(users[i].username);
    //}
    console.log("-> example - ",users[5].username)
}