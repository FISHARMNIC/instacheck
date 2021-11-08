/*
 * program: List Compare
 * author: Nicolas Quijano
 * version: 1.0
*/

var arr1 = [
    "jon",
    "ryan",
    "bob"
]

var arr2 = [
    "jon",
    "ryan",
    "michael"
]

module.exports = function(arr1, arr2) {

    var longerList;
    var shorterList;
    var selected;

    var missing = [];
    var missing2 = [];

    var gained = [];
    var lost = [];

    if (arr1.length > arr2.length) {
        longerList = arr1;
        shorterList = arr2;
        selected = 0;
    } else {
        longerList = arr2;
        shorterList = arr1;
        selected = 1;
    }


    for (i = 0; i < longerList.length; i++) {
        //console.log(i)
        if (!shorterList.includes(longerList[i])) {
            missing.push(longerList[i]);
        } if (!longerList.includes(shorterList[i])) {
            missing2.push(shorterList[i]);
        }
    }

    if (selected) {
        gained = missing
        lost = missing2
    } else {
        gained = missing2
        lost = missing
    }
    return({gained,lost})
}
