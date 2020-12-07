var statisticsTranslation = {
    trafic: {
        title: {
            nl: "Verkeer",
            en: "Trafic"
        },
        visitors: {
            nl: "Bezoekers Vandaag",
            en: "Visitors Today"
        },
        login: {
            nl: "Vandaag Ingelogd",
            en: "Logged in Today"
        },
        device: {
            nl: "Toestel Type",
            en: "Type Device"
        },
        browser: {
            nl: "Browser Type",
            en: "Browser Type"
        },
    },
    users: {
        title: {
            nl: "Gebruikers",
            en: "Users"
        },
        accounts: {
            nl: "Aantal Accounts",
            en: "Total Accounts"
        },
        visit: {
            nl: "Meest bezochten uur:",
            en: "Most Visited Hour:"
        },
    },
    matching: {
        title: {
            nl: "Matchen",
            en: "Matching"
        },
        friends: {
            nl: "Totaal Aantal Vrienden",
            en: "Made Friends"
        },
        friendsAvg: {
            nl: "Gemiddelde Aantal Vrienden Per Gebruiker",
            en: "Average Friends Per User"
        },
        equalInterest: {
            nl: "Meest Gematchde Interesses:",
            en: "Most Matched With Equal Interest:"
        },
        equalDestination: {
            nl: "Meest Gematchde Locaties:",
            en: "Most Matched With Equal Destination:"
        }
    },
    pages: {
        title: {
            nl: "Pagina's",
            en: "Pages"
        },
        logout: {
            nl: "Accounts uitgelogd op:",
            en: "Logged out on:"
        },
        views: {
            nl: "Aantal Keer Bekeken:",
            en: "Amount of Views:"
        }
    }
};
FYSCloud.Localization.CustomTranslations.addTranslationJSON(statisticsTranslation);

var pieChartColors = [
    "#2ecc71",
    "#3498db",
    "#95a5a6",
    "#9b59b6",
    "#f1c40f",
    "#e74c3c",
    "#34495e"
];

function generatePiechart(divID, data) {
    //Create a Chart.js pie chart.
    var context = $(divID);
    var myChart = new Chart(context, {
        type: 'pie',
        data: {
            labels: data[0],
            datasets: [{
                backgroundColor: pieChartColors,
                data: data[1]
            }]
        }
    });

}

function makeOL(array) {
    // Create the list element:
    var list = document.createElement('div');
    for (var i = 0; i < array[0].length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.appendChild(document.createTextNode(array[0][i]));
        if (array[1] != null)
            item.appendChild(document.createTextNode(" (" + array[1][i] + ")"));
        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}


(async function fetchStatisticsFromDatabase() {
    // ~~~~ FETCH AMOUNT OF USERS ~~~~
    let userCount;
    await getDataByPromise(`SELECT Count(*) AS totalUserCount
                            FROM user`).then((data) => {
        userCount = data[0]["totalUserCount"];
        $('#total-accounts').html(userCount);
    });
    // ~~~~ FETCH ALL FRIENDS ~~~~
    getDataByPromise(`SELECT *
                      FROM friend`).then((data) => {
        let totalFriendsCount = data.length;

        // ** MATCHING - MADE FRIENDS **
        $('#made-friends').html(totalFriendsCount);
        // ** MATCHING - AVERAGE FRIENDS PER USER
        $('#made-friends-average').html((totalFriendsCount / userCount).toFixed(2));
    });
    // ~~~~ FETCH ALL SESSIONS ~~~~
    getDataByPromise(`SELECT *
                      FROM adminsessiondata`).then((adminSessionData) => {
        let loginTodayAmount = 0;
        let allHours = new Array(adminSessionData.length);
        for (let i = 0; i < adminSessionData.length; i++) {
            let loginDate = new Date(adminSessionData[i]["logintime"]);
            allHours[i] = loginDate.getHours();
            loginTodayAmount += isDateToday(loginDate);
        }
        // ** USERS - MOST VISITED HOUR **
        $('#visit-time-average').html(findCommon(allHours));
        // ** TRAFFIC - LOGGED IN TODAY **
        $('#logged-in').html(loginTodayAmount);
    });
})();

(async function fetchMatchesLists() {
    let interestData;
    await getDataByPromise(`SELECT *
                            FROM admininterestdata
                            ORDER BY interestEverMatched DESC
                            LIMIT 10;`).then(data => {
        interestData = data;
        let interestIDString = jsonIndexToArrayString(interestData, "interestId");
        return getDataByPromise(`SELECT *
                      FROM interest
                      WHERE id IN ${interestIDString}`);
    }).then(names => {
        let combinedArray = combineJsonToArray(names, interestData, "name", "interestEverMatched");
        // ** MATCHING - MOST FRIENDS WITH EQUAL DESTINATION **
        $('#most-match-equal-interests').html(makeOL(combinedArray));
    });

    let locationData;
    await getDataByPromise(`SELECT *
                            FROM adminlocationdata
                            ORDER BY destinationEverMatched DESC
                            LIMIT 10;`).then(data => {
        locationData = data;
        let notificationIDString = jsonIndexToArrayString(locationData, "locationId");
        return getDataByPromise(`SELECT *
                      FROM location
                      WHERE id IN ${notificationIDString}`);
    }).then(names => {
        let combinedArray = combineJsonToArray(names, locationData, "destination", "destinationEverMatched");
        // ** MATCHING - MOST FRIENDS WITH EQUAL DESTINATION **
        $('#most-match-equal-destination').html(makeOL(combinedArray));
    });
})();

(function fetchPages() {
    getDataByPromise(`SELECT *
                      FROM adminpagedata
                      ORDER BY logoutamount DESC`).then((data) => {
        // ** LOGOUT-AMOUNT **
        $('#page-logout').html(makeOL(jsonToArray(data, ["name", "logoutamount"])));
    });

    getDataByPromise(`SELECT *
                      FROM adminpagedata
                      ORDER BY visitcount DESC`).then((data) => {
        // ** AMOUNT OF VIEWS **
        $('#page-views').html(makeOL(jsonToArray(data, ["name", "visitcount"])));
    });
})();

(function fetchTraffic() {
    getDataByPromise(`SELECT deviceType, count(*) as 'amount'
                      FROM adminsessiondata
                      GROUP BY deviceType`).then((data) => {
        // ** TYPE DEVICE **
        generatePiechart('#device-type', jsonToArray(data, ["deviceType", "amount"]));
    });

    getDataByPromise(`SELECT browserType, count(*) as 'amount'
                      FROM adminsessiondata
                      GROUP BY browserType`).then((data) => {

        // ** BROWSER TYPE **
        generatePiechart('#browser-type', jsonToArray(data, ["browserType", "amount"]));
    });
})();

/**
 * Creates a Multidimensional Array from a JSON object.
 * @param json JSON Object.
 * @param attributes list of attribute names. length of array defines width of returned Array.
 * @returns {[[*], [*]]} Multidimensional Array.
 */
function jsonToArray(json, attributes) {
    let multiArray = [[json.length], [json.length]];
    for (let i = 0; i < json.length; i++) {
        for (let atrI = 0; atrI < attributes.length; atrI++) {
            multiArray[atrI][i] = json[i][attributes[atrI]];
        }
    }
    return multiArray;
}

/**
 * combines a list of jsons values to a string used for queries.
 */
function jsonIndexToArrayString(json, attributeName) {
    let notificationIDs = new Array(json.length);
    for (let i = 0; i < notificationIDs.length; i++) {
        notificationIDs[i] = json[i][attributeName];
    }
    return "(" + notificationIDs.toString() + ")";
}

/**
 * Combines two JSON arrays to a single array (fixed size of first element of 2)
 */
function combineJsonToArray(arr1, arr2, atr1, atr2) {
    let newArray = [[2], [arr1.length]];
    for (let i = 0; i < arr1.length; i++) {
        newArray[0][i] = arr1[i][atr1];
        newArray[1][i] = arr2[i][atr2];
    }
    return newArray;
}

/**
 * Checks whether a Date object is the same as the current date.
 * @param date the Date object being checked.
 * @returns {boolean} whether the Date is of today or not.
 */
function isDateToday(date) {
    let today = new Date();
    if (date.getDate() !== today.getDate())
        return false;
    if (date.getMonth() !== today.getMonth())
        return false;
    if (date.getFullYear() !== today.getFullYear())
        return false;

    return true;
}