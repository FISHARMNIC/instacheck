//https://i.instagram.com/api/v1/friendships/44813038957/followers/?count=12&search_surface=follow_list_page
//Users/squijano/Library/Application Support/Chromium/Default/Cookies
/*
 * program: Instagram follow remover bot
 * author: Nicolas Quijano
 * version: 1.0
*/

const colors = require('colors');

const fs = require('fs');
const https = require('https');
const strcmp = require('./compare.js');

const count = 1000; //IF FOLLOWERS ARE MORE, MAKE THIS HIGHER
const chrome = require('chrome-cookies-secure');

var userID;
var allDataGotten;
var allCookies;
var username = process.argv[2]
var users;
var cookie;
var oJSON;
var followersArray;

var DATAOUT;

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
        console.log("-> USERID ".green, userID)
        start();
    });
}

async function start() {

    // -- GET THE FOLLOW LIST
    await getFollowList()

    // -- GET THE USERID AND PREPARE FOR CHECKING
    await getUsers()

    // -- CHECK THAT THE USER ID MATCHES
    checkUsers()

    // -- VALIDATES THE DATA AND PARSES IT
    parseData()

    // -- PARSE THE FOLLOW LIST
    parseFollowers()

    // -- COMPARE THE TWO GOT LISTS
    compare()

    // -- SAVE THE FOLLOWERS INTO THE FILE
    saveFollowers()
}

function compare() {
    var oldFollowers = String(fs.readFileSync("../data/savedFollowers.txt")).split("\n")
    var followersDiff = strcmp(oldFollowers, followersArray)
    console.log("-> Example compare:".yellow, oldFollowers.includes(followersArray[0]), oldFollowers[0], followersArray[0])
    console.log("-> Example compare 2:".yellow, oldFollowers.includes("vedant.mahehe"), followersArray.includes("vedant.mahehe"))
    console.log(`
#============#
GAINED:
--> ${followersDiff.gained == "" ? "NONE" : followersDiff.gained}
LOST:
--> ${followersDiff.lost == "" ? "NONE" : followersDiff.lost}
#============#
`.bgBlack.white)

}

/* #region GET FUNCTIONS   */

async function getFollowList() {
    await doReq({
        prefix: "i",
        path: `/api/v1/friendships/${userID}/followers/?count=${count}&search_surface=follow_list_page`,
    })
    oJSON = DATAOUT
}

async function getUsers() {
    await doReq({
        prefix: "www",
        path: `/${username}/?__a=1`,
    })
}

function checkUsers() {
    try {
        var oData = JSON.parse(DATAOUT)
        if (oData.graphql.user.id != userID) {
            console.log("WARNING: Cookies are not tied to the given username:".red, username)
            console.log("WARNING: This happens when you have more than one account tied to your computer or are not accessing your own account".red)
        }
    } catch (e) {
        console.error("Wrong headers!".red)
        process.exit(1);
    }
}

function parseData() {
    try {
        allDataGotten = JSON.parse(oJSON)
        //allDataGotten = JSON.parse(fs.readFileSync("out.json"));
        if ((allDataGotten == undefined) || (JSON.stringify(allDataGotten).includes('"message":"useragent mismatch","status":"fail"'))) {
            console.log("unsuccessful - incorrect keys".red);
            process.exit(1);
        }
        console.log("-> Successful followers".green);
    } catch (e) {
        console.error("UNSUCCESSFUL - got html".red);
        process.exit(1);
    }

    users = allDataGotten.users;
    console.log("-> Example - ".yellow, users[5].username)
}

function parseFollowers() {

    followersArray = []
    users.forEach(x => {
        followersArray.push(x.username)
    })
    followersArray = followersArray.sort()//.join("\n");
    console.log("-> Followers parsed successfully".green)

}

function saveFollowers() {
    fs.writeFileSync("../data/savedFollowers.txt", followersArray.join("\n"))
    console.log("-> File written successfully")
}

// -- MAIN REQUEST FUNCTION
function doReq({ prefix, path, }) {
    return new Promise(resolve => {
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
                DATAOUT = data
                resolve(true);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    });
}

/* #endregion */