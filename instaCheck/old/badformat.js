//https://i.instagram.com/api/v1/friendships/44813038957/followers/?count=12&search_surface=follow_list_page
//Users/squijano/Library/Application Support/Chromium/Default/Cookies

const fs = require('fs');
const https = require('https');

const count = 1000; //IF FOLLOWERS ARE MORE, MAKE THIS HIGHER
const chrome = require('chrome-cookies-secure');

var userID;
var allDataGotten;
var allCookies;
var username = "nicolas.quijano1"
var users;
var cookie;

init();

// -- GETS COOKIES NEEDED FOR THE HEADER KEYS
function init() {
    chrome.getCookies(`https://www.instagram.com`, function (err, cookies) {
        allCookies = cookies;
        allCookies.sessionid = allCookies.sessionid.replace(/%3A/g, ":")
        allCookies.shbid = allCookies.shbid.replace(/\\054/g, ",")
        allCookies.shbts = allCookies.shbts.replace(/\\054/g, ",")
        allCookies.rur = allCookies.rur.replace(/\\054/g, ",")
        userID = allCookies.ds_user_id

        cookie = 'ig_did=' + allCookies.ig_did + '; ig_nrcb=' + allCookies.ig_nrcb + '; mid=' + allCookies.mid + '; csrftoken=' + allCookies.csrftoken + '; sessionid=' + allCookies.sessionid + '; shbid="' + allCookies.shbid + '"; shbts="' + allCookies.shbts + '"; ds_user_id=' + allCookies.ds_user_id + '; rur="' + allCookies.rur + '"'
        
        console.log(allCookies)
        console.log("-> USERID ", userID)
        main()
    });
}

// -- MAKES GET REQUEST AND RETURNS DATA
async function main() {
    const options = {
        hostname: "i.instagram.com",
        path: `/api/v1/friendships/${userID}/followers/?count=${count}&search_surface=follow_list_page`,
        headers: {
            "x-ig-app-id": '936619743392459',
            cookie: cookie,
        }
    }
    
    https.get(options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            fs.writeFileSync("out.json", data);
            checkUser();
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function checkUser() {
    const options = {
        hostname: "www.instagram.com",
        path: `/${username}/?__a=1`,
        headers: {
            "x-ig-app-id": '936619743392459',
            cookie: cookie,
        }
    } 

    https.get(options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            //console.log(data)
            try {
                var oData = JSON.parse(data)
                if(oData.graphql.user.id != userID) {
                    console.log("WARNING: Cookies are not tied to the given username")
                }
            } catch (e) {
                console.error("Wrong headers!")
                process.exit(1);
            }
            gotData();
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function doReq({prefix, path, whenDone}) {
    const options = {
        hostname: `${prefix}.instagram.com`,
        path: path,
        headers: {
            "x-ig-app-id": '936619743392459',
            cookie: cookie,
        }
    } 

    https.get(options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            whenDone(data);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}
// -- VALIDATES THE DATA AND PARSES IT
function gotData() {
    try {
        allDataGotten = JSON.parse(fs.readFileSync("out.json"));
        if ((allDataGotten == undefined) || (JSON.stringify(allDataGotten).includes('"message":"useragent mismatch","status":"fail"'))) {
            console.log("unsuccessful - incorrect keys");
            process.exit(1);
        }
        console.log("-> Successful folloowers");
    } catch (e) {
        console.error("UNSUCCESSFUL - got html");
        process.exit(1);
    }

    users = allDataGotten.users;
    console.log("-> Example - ", users[5].username)
    writeToFile();
}

// -- SAVES THE FOLLOWERS
function writeToFile(){
    var out = []
    users.forEach(x => {
        out.push(x.username)
    })
    out = out.sort().join("\n");
    fs.writeFileSync("../Data/savedFollowers.txt", out)
    console.log("-> File written successfully")
}