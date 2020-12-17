window.addEventListener('load', function () {
    //clicks on the 'All results' tab so it's open by default
    $("#all-results").click();

    //updates the display of the user's current travel data
    updateCurrentTravelData()

    //on page load this function will populate a select list using data from the database
    populateCityList();
})

let slide = 0;
/**  displays the next slide */
function displayNextSlide(arrow) {
    switch (slide) {
        case 0: arrow.id.toString() === "left-arrow" ? slide = 2 : slide++; break;
        case 1: arrow.id.toString() === "left-arrow" ? slide-- : slide++; break;
        case 2: arrow.id.toString() === "left-arrow" ? slide-- : slide = 0; break;
    }
    $("#h1-slide").attr("data-translate", `slide.h1.${slide}`);
    $("#p-slide").attr("data-translate", `slide.text.${slide}`);
    FYSCloud.Localization.translate(false);
}

/** toggles the current travel data display and the travel data form */
function toggleTravelForm() {
    $("#travel-form").slideToggle("slow");
    $("#currentTravelData").slideToggle("slow");
}

/** gets the users current travel data and sets it on the travel data display */
async function updateCurrentTravelData() {
    let currentTravelData= await getDataByPromise(`SELECT 
    t.startdate, t.enddate, l.destination
    FROM travel t
    INNER JOIN location l ON t.locationId = l.id
    WHERE userId = ?`, getCurrentUserID());

    //sets the travel data of the current user on the page
    let date = new Date(currentTravelData[0]["startdate"]);
    $("#current-start-date").html(`${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`);
    date = new Date(currentTravelData[0]["enddate"]);
    $("#current-end-date").html(`${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`);
    $("#current-city").html(currentTravelData[0]["destination"]);
}

async function populateCityList() {
    let travelData = await getDataByPromise("SELECT `startdate`, `enddate` FROM travel WHERE userId = ?", [getCurrentUserID()]);
    //query the database for all location data using a promise
    let cityList = await getDataByPromise("SELECT * FROM location");

    if(travelData.length > 0) {

    getStartdate = travelData[0]["startdate"].split("T")[0];
    getEnddate = travelData[0]["enddate"].split("T")[0];

    document.getElementById("sDate").value = getStartdate;
    document.getElementById("eDate").value = getEnddate;

    }

    //for each loop that populates the cityList select options with data from the database
    $(cityList).each(city => {
    $("#cityList").append(`<option value=${cityList[city]["id"]}>` + cityList[city]["destination"] + `</option>`);
    });
}

function sendTravelData() {
    //get current selected value from select element in form
    var citySelect = document.getElementById("cityList").value;
    
    var startDate = new Date($('#sDate').val());
    var endDate = new Date($('#eDate').val());

    startDateFormat = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate()
    endDateFormat = endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate()
    
//check if user already has a travel spec data
    FYSCloud.API.queryDatabase("SELECT * FROM travel WHERE `userId` = ?;",
    [getCurrentUserID()]).done(function(data){
        console.log(data.length)
        if(data.length > 0) {
            if(startDateFormat != "" && endDateFormat != "") {
                FYSCloud.API.queryDatabase(
                    "UPDATE `travel` SET `locationId` = ? ,`startdate` = ? ,`enddate` = ? WHERE `userId` = ?;",
                    [citySelect, startDateFormat, endDateFormat, getCurrentUserID()])
            }else{
                alert("no date or city selected");
            }
        }else {
            if(startDateFormat != "" && endDateFormat != "") {
            FYSCloud.API.queryDatabase("INSERT INTO `travel` (`userId`, `locationId`, `startdate`, `enddate`) VALUES (?, ?, ?, ?)",
            [getCurrentUserID(), citySelect, startDateFormat, endDateFormat])
                }else{
                alert("no date or city selected");
            }
        }
    })
    //sets the current travel data display closes the travel form
    updateCurrentTravelData().then(toggleTravelForm());
}

//1.1 All results todo: gender preference, blocked, display settings en evt. interests
//todo: filters; distance and buddy type
let lastButtonId;
/** function to switch the tab content and active tab-button */
async function openTabContent(currentButton) {

    //disallows the user from spamming a tab-button
    if(lastButtonId === currentButton.id) {return}
    lastButtonId = currentButton.id;

    let tab = $("#tab");

    //swaps the button colors
    $(".tab-button").css("backgroundColor", "");
    $(currentButton).css("backgroundColor", "#c11905");

    //resets the filters
    resetFilters();

    //gets the current user's data
    const CURRENT_USER = await getDataByPromise(`SELECT 
       u.id, 
       t.userId, t.locationId, t.startdate, t.enddate,
       l.*
    FROM fys_is111_1_dev.user u
    INNER JOIN travel t ON u.id = t.userId
    INNER JOIN location l ON t.locationId = l.id
    WHERE u.id = ?`, getCurrentUserID());

    let queryExtension = ``;
    let queryArray = [];
    let noMatchesMessage = `<p class="no-matches-message" data-translate="tab.empty.allResults"></p>`;
    switch (currentButton.id.toString()) {
        case "all-results":
            queryExtension = ` AND t.startdate < ?
            AND t.enddate > ?
            AND p.userId != ?
            AND (6371 * acos(cos(radians(l.latitude)) * cos(radians(?)) * cos(radians(?) - radians(l.longitude)) + sin(radians(l.latitude)) * sin(radians(?)))) < IFNULL(s.radialDistance, 999999)`;
            queryArray = [CURRENT_USER[0]["enddate"], CURRENT_USER[0]["startdate"], getCurrentUserID(), CURRENT_USER[0]["latitude"], CURRENT_USER[0]["longitude"], CURRENT_USER[0]["latitude"]];
            break;
        case "friends":
            queryExtension = ` AND (fr.user1 = ${CURRENT_USER[0]["userId"]} OR fr.user1 = p.userId) AND (fr.user2 = ${CURRENT_USER[0]["userId"]} OR fr.user2 = p.userId)`;
            noMatchesMessage = `<p class="no-matches-message" data-translate="tab.empty.friends"></p>`;
            break;
        case "friend-requests":
            queryExtension = ` AND rq.requestingUser = p.userId AND rq.targetUser = ${CURRENT_USER[0]["userId"]}`;
            noMatchesMessage = `<p class="no-matches-message" data-translate="tab.empty.friendRequests"></p>`;
            break;
        case "favourites":
            queryExtension = ` AND f.requestingUser = ${CURRENT_USER[0]["userId"]} AND f.favouriteUser = p.userId`;
            noMatchesMessage = `<p class="no-matches-message" data-translate="tab.empty.favourites"></p>`;
            break;
    }

    //gets the data of the relevant users for the current user
    //calculating distance snippet from stackoverflow answer; https://stackoverflow.com/a/48263512
    let userList = await getDataByPromise(`SELECT 
       p.userId, p.pictureUrl, p.buddyType, 
       u.username,
       r.roleId, 
       s.radialDistance,
       t.startdate, t.enddate,
       l.*,
       f.favouriteUser
    FROM profile p
    INNER JOIN user u ON u.id = p.userId
    INNER JOIN userrole r ON r.userId = p.userId
    LEFT JOIN setting s ON s.userId = p.userId
    INNER JOIN travel t ON t.userId = p.userId
    INNER JOIN location l ON l.id = t.locationId
    LEFT JOIN favourite f ON f.requestingUser = ${CURRENT_USER[0]["userId"]} AND f.favouriteUser = p.userId
    LEFT JOIN friend fr ON (fr.user1 = ${CURRENT_USER[0]["userId"]} OR fr.user1 = p.userId) AND (fr.user2 = ${CURRENT_USER[0]["userId"]} OR fr.user2 = p.userId)
    LEFT JOIN friendrequest rq ON (rq.requestingUser = p.userId AND rq.targetUser = ${CURRENT_USER[0]["userId"]})
    WHERE r.roleId != 2`+ queryExtension
        , queryArray);

    // console.log(userList)

    $(tab).html("");
    if (userList.length !== 0) {
        //appends a user-display with the correct data to the tab for every user that needs to be displayed
        for (let i = 0; i < userList.length; i++) {
            $(tab).append(generateUserDisplay(userList[i]))
        }
    } else {
        //displays a help message whenever there are no matches available to the user
        $(tab).append(noMatchesMessage)
    }

    FYSCloud.Localization.translate(false);
}

/** function for generating a user display */
function generateUserDisplay(currentUser) {

    let userId = currentUser["userId"];

    let userDisplay = document.createElement("div");
    userDisplay.className = "user-display";
    userDisplay.setAttribute("id", "user-display-" + userId);

    let username = currentUser["username"] === "" ? "username" : currentUser["username"];
    let url = "https://dev-is111-1.fys.cloud/uploads/profile-pictures/" + currentUser["pictureUrl"];
    let location = currentUser["destinationd"] === "" ? "destination" : currentUser["destination"];
    let favouriteVersion = currentUser["favouriteUser"] === null ? 1 : 2;

    //buddy
    let buddy = `<p data-translate="userDisplay.buddy.default"></p>`;
    if (currentUser["buddyType"] === 2) buddy = `<p data-translate="userDisplay.buddy.activity"></p>`;
    if (currentUser["buddyType"] === 3) buddy = `<p data-translate="userDisplay.buddy.travel"></p>`;
    
    //start and end date
    //todo: fix the displaying of dates
    //todo: fix translations
    let date = new Date(currentUser["startdate"]);
    let startDate = currentUser["startdate"] === "" ? "start date" : `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    let endDate = currentUser["enddate"] === "" ? "end date" : `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

    userDisplay.innerHTML =
        `<h1 id=user-display-h1-${userId}>${username}</h1>
            <img onerror="this.src='https://dev-is111-1.fys.cloud/uploads/profile-pictures/default-profile-picture.png'" class="profile-picture" src="${url}">
            <div class="user-display-column-3">
                <p>${location}</p>
                <span><p data-translate="userDisplay.from">from </p><p>${startDate}</p></span>
                <span><p data-translate="userDisplay.until">from </p><p>${endDate}</p></span>
                <p class="buddy">${buddy}</p>
            </div>
            <div class="user-display-column-4">
                <button id="button1-${userId}" onclick="openUserOverlay('${userId}')" data-translate="userDisplay.moreInfo">more info</button>
                <button id="button2-${userId}" onclick="closeElement('user-display-${userId}')">X</button>
            <div id="favourite-v1-${userId}" onclick="setFavourite('${userId}', 'favourite-v1-${userId}',)">
            <img src="Content/Images/favourite-v${favouriteVersion}.png" class="favourite-icon">
            </div>
            </div>
            </div>`;

    // requestButton.attr("data-translate", "overlay.button.sent");
    // requestButton.attr("data-translate", "overlay.button.sent");

    return userDisplay;
}

/**
 * function for opening the overlay with the correct user data
 * @param overlayUserId id of the user that is fetched and displayed from the database.
 */
async function openUserOverlay(overlayUserId) {
    //disable scrolling
    document.body.style.overflow = 'hidden';
    document.querySelector('html').scrollTop = window.scrollY;

    //get user profile.
    let overlayUserData = await getDataByPromise(`SELECT 
       p.*, u.username, u.id
    FROM profile p
    INNER JOIN user u ON p.userId = u.id
    WHERE u.id = ?`, overlayUserId);

    let overlayUserInterestsIds = await getDataByPromise("SELECT * FROM fys_is111_1_dev.userinterest WHERE userId = ?", overlayUserId);

    //setting the data from the user and profile tables for in the overlay
    let url = "https://dev-is111-1.fys.cloud/uploads/profile-pictures/" + overlayUserData[0]["pictureUrl"]
    let fullName = overlayUserData[0]["firstname"] + " " + overlayUserData[0]["lastname"];

    //putting the data from the user and profile tables in the overlay
    $("#overlay-row-1").html(`<img onerror="this.src='https://dev-is111-1.fys.cloud/uploads/profile-pictures/default-profile-picture.png'" src="${url}">`);
    $("#overlay-full-name").html(`${fullName}`);
    $("#overlay-username").html(`a.k.a. ${overlayUserData[0]["username"]}`);
    $("#overlay-bio").html(`${overlayUserData[0]["biography"]}`);
    //putting the interests into the overlay
    $("#overlay-interests-ul").html("");
    $(overlayUserInterestsIds).each(interest => {
        $("#overlay-interests-ul").append(`<li>` + overlayUserInterestsIds[interest]["interestId"] + `</li>`);
    });

    //displays the overlay and overlay-background
    displayUserOverlay();

    //determine what kind of request button we want to show the user,
    let matchingFriend = await getDataByPromise(`SELECT *
    FROM friendrequest
    WHERE (targetUser = ? AND requestingUser = ?)
    OR (targetUser = ? AND requestingUser = ?)
    `, [getCurrentUserID(), overlayUserId, overlayUserId, getCurrentUserID()]);

    //Reset button style elements.
    let requestButton = $("#send-request-button");
    requestButton.attr("disabled", false);
    requestButton.unbind();
    requestButton.css('opacity', '1');
    requestButton.hover(function () { $(this).css("background-color", "var(--color-corendon-dark-red)");
        }, function () { $(this).css("background-color", "");} );


    if (matchingFriend[0] != null) {
        if (matchingFriend[0]["requestingUser"] === parseInt(getCurrentUserID())) { //We already send the request
            disableRequestButton();
        } else if (matchingFriend[0]["targetUser"] === parseInt(getCurrentUserID())) { //We got a request
            requestButton.attr("data-translate", "overlay.button.accept");
            requestButton.click(function (){acceptRequest(getCurrentUserID(),overlayUserId)});
        }
    } else {
        requestButton.attr("data-translate", "overlay.button.send");
        requestButton.click(function () {sendRequest(getCurrentUserID(),overlayUserId)});
    }

    $("#profile-button").click(function () {redirectToProfileById(overlayUserId)});
}

function disableRequestButton() {
    let requestButton = $("#send-request-button");
    requestButton.hover();
    requestButton.css('opacity', '0.6');
    requestButton.attr("disabled", true);
    requestButton.attr("data-translate", "overlay.button.sent");
    FYSCloud.Localization.translate(false);
}

function acceptRequest(acceptedUser,userIdToAccept) {
    getDataByPromise(`DELETE FROM friendrequest
                      WHERE (targetUser = ${acceptedUser} AND requestingUser = ${userIdToAccept})
                         OR (targetUser = ${userIdToAccept} AND requestingUser = ${acceptedUser});
                      DELETE FROM usernotification
                      WHERE (targetUser = ${acceptedUser} AND requestingUser = ${userIdToAccept})
                         OR (targetUser = ${userIdToAccept} AND requestingUser = ${acceptedUser});
                      INSERT INTO friend (user1, user2)
                      VALUES (${acceptedUser},${userIdToAccept});
    `).then((data) => sendFriendMatchData(userIdToAccept));
    //todo: remove element from display tab.
    closeUserOverlay();
}

async function sendFriendMatchData(userIdToAccept){
    //Get current user travel destination
    const CURRENT_USER = await getDataByPromise(`SELECT *
    FROM travel WHERE id = ?`, getCurrentUserID());
    //Send the location that we currently have to the database.
    await getDataByPromise(`INSERT INTO adminlocationdata (locationId, destinationEverMatched)
                            VALUES (?, 1)
                            ON DUPLICATE KEY UPDATE destinationEverMatched = destinationEverMatched + 1`, CURRENT_USER["destination"]);
    //Check which interests are equal
    //TODO: Add interests to results query.
    const userInterests = await getDataByPromise(`SELECT * FROM userinterest WHERE userId = ?`,getCurrentUserID());
    const otherUserInterest = await getDataByPromise(`SELECT * FROM userinterest WHERE userId = ?`,userIdToAccept);
    $(userInterests).each(uInterest => {
        $(otherUserInterest).each(oInterest => {
            if(userInterests[uInterest]["interestId"] === otherUserInterest[oInterest]["interestId"])
                //Send statistic data for interests.
                getDataByPromise(`INSERT INTO admininterestdata (interestId, interestEverMatched)
                                  VALUES (?, 1)
                                  ON DUPLICATE KEY UPDATE interestEverMatched = interestEverMatched + 1`, userInterests[uInterest]["interestId"]);
        });
    });
}

function sendRequest(sentUser,userIdToSend) {
    getDataByPromise(`INSERT INTO friendrequest (requestingUser, targetUser)
                      VALUES (${sentUser},${userIdToSend});
                      INSERT INTO usernotification (requestingUser, targetUser)
                      VALUES (${sentUser},${userIdToSend});`).then((data) => {
        // console.log(data);
    });
    disableRequestButton();
}

/** function for opening the overlay */
function displayUserOverlay() {
    $("#overlay").css("display", "flex");
    $("#overlay-background").css("display", "block");
}

function closeUserOverlay(){
    document.body.style.overflow = null;
    closeElement("overlay");
}
/** function to close the active user-display or overlay */
function closeElement(currentDisplay) {
    $("#" + currentDisplay).css("display", "none");
    $("#overlay-background").css("display", "none");
}

/** favourites function */
async function setFavourite (userId) {

    let favourite = await getDataByPromise(`SELECT * FROM favourite
    WHERE requestingUser = ? AND favouriteUser = ?`, [getCurrentUserID(), userId]);

    if (favourite["length"] === 0) {
        FYSCloud.API.queryDatabase(
            `INSERT INTO favourite (requestingUser, favouriteUser) VALUES (?, ?)`, [getCurrentUserID(), userId]
        ).done(function () {
            $(`#favourite-v1-${userId}`).html(`<img src="Content/Images/favourite-v2.png" class="favourite-icon">`)
            console.log("added")
        }).fail(function (reason) {
            console.log(reason)
        });
    } else if (favourite["length"] === 1) {
        FYSCloud.API.queryDatabase(
            `DELETE FROM favourite WHERE requestingUser = ? AND favouriteUser = ?`, [getCurrentUserID(), userId]
        ).done(function () {
            $(`#favourite-v1-${userId}`).html(`<img src="Content/Images/favourite-v1.png" class="favourite-icon">`)
            console.log("deleted")
        }).fail(function (reason) {
            console.log(reason)
        })
    }
}

/** Filters */
var currentDistanceFilterAmount;

function setTravelFilter(element) {
    let distanceAmount = $(element).data("distance");
    if (currentDistanceFilterAmount === distanceAmount)
        return;
    $(".filter-option-distance").removeAttr("current");
    $(element).attr("current", "");
    currentDistanceFilterAmount = distanceAmount;

    //todo: apply filter.
}

var currentBuddyFilterID;

function setBuddyFilter(element) {
    let buddyIndex = $(element).data("buddy");
    if (currentBuddyFilterID === buddyIndex)
        return;
    $(".filter-option-buddy").removeAttr("current");
    $(element).attr("current", "");
    currentBuddyFilterID = buddyIndex;

    //todo: apply filter.
}

function resetFilters() {
    //remove all current attributes from options
    $(".filter-option-buddy").removeAttr("current");
    $(".filter-option-distance").removeAttr("current");
    //set the default buddy option.
    let buddyDefault = $("#filter-option-buddy-default");
    currentBuddyFilterID = buddyDefault.data("buddy");
    buddyDefault.attr("current", "");
    //set the defualt distance option.
    let distanceDefault = $("#filter-option-distance-default");
    currentDistanceFilterAmount = buddyDefault.data("distance");
    distanceDefault.attr("current", "");
}
