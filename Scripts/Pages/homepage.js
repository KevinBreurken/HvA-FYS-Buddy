window.addEventListener('load', function () {
    //clicks on the 'All results' tab so it's open by default
    $("#all-results").click();

    
    // todo: filter the user data
    //toggle
    //radiobuttons
    //als je op deze radiobutton klikt, dan ..
})

//1. todo: create different query's;
//1.1 All results: all results matching the users location, date and gender preference
//1.2 Friends
//1.3 Friend requests (ingoing)
//1.4 Favorites

//todo: 2. filters; distance and buddy type

//todo: 3. match only gender

//todo: set button color depending on if there is an outgoing friend request, the user if friends with the user or no action
//todo: send notification to the other user
//function(s) for setting the status of the 'send friend request' button and sets database data

//todo: set favorites data in the database when clicking (swap)

/** function to switch the tab content and active tab-button */
async function openTabContent (currentButton) {
    //swaps the button colors
    $(".tab-button").css("backgroundColor", "");
    $(currentButton).css("backgroundColor", "#c11905");

    console.log(currentButton.id)

    //todo: querys
    //"SELECT * FROM user"
    //query, queryArray
    let userList = await getDataByPromise("SELECT * FROM user");

    let tab = $("#tab");
    $(tab).html("");
    $(userList).each(user => $(tab).append(generateUserDisplay(user)));
}

/** function for generating a user display */
function generateUserDisplay(currentUser)
{
    let userId = currentUser.userId;

    let userDisplay = document.createElement("div");
    userDisplay.className = "user-display";
    userDisplay.setAttribute("id", "user-display-" + userId);

    let username = currentUser.username === "" ? "username" : currentUser.username;
    let url = currentUser.url === "" ? "https://dev-is111-1.fys.cloud/uploads/profile-pictures/default-profile-picture.png" : currentUser.url;
    let location = currentUser.location === "" ? "location" : currentUser.location;

    //start and end date
    let date = new Date(currentUser.startDate);
    const startDate = currentUser.startDate === "" ? " " : `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    date = new Date(currentUser.endDate);
    const endDate = currentUser.endDate === "" ? " " : `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;

    //todo: buddyId's or buddyClass | (activity-1) / (travel-1) / (both-1) of (activity) / (travel) / (both)
    let buddy;
    if (currentUser.travelBuddy === 1 && currentUser.activityBuddy === 1) {
        buddy = "a buddy";
    } else if (currentUser.travelBuddy === 1 && !(currentUser.activityBuddy === 1)) {
        buddy = "a travel buddy";
    } else if (!(currentUser.travelBuddy === 1) && currentUser.activityBuddy === 1) {
        buddy = "an activity buddy";
    } else {
        buddy = " a buddy";
    }

    //todo: add buddyId or buddyClass
    userDisplay.innerHTML =
        `<h1 id=user-display-h1-${userId}>${username}</h1>
            <img class="profile-picture" src="${url}">
            <div>
            <p>${location}</p>
            <p>from ${startDate}</p>
            <p>until ${endDate}</p>
            <p>${buddy}</p>
            </div>
            <div class="tab-content-column-4">
            <button id="button1-${userId}" onclick="openUserOverlay('${userId}')">more info</button>
            <button id="button2-${userId}" onclick="closeElement('user-display-${userId}')">X</button>
            <div id="favorite-v1-${userId}" onclick="setFavorite('favorite-v1-${userId}','favorite-v2-${userId}')">
            <img class="favorite-icon" src="Content/Images/favorite-v1.png">
            </div>
            <div id="favorite-v2-${userId}" style="display: none" onclick="setFavorite('favorite-v2-${userId}','favorite-v1-${userId}')">
            <img class="favorite-icon" src="Content/Images/favorite-v2.png">
            </div>
            </div>
            </div>`;

    return userDisplay;
}

/** function for opening the overlay with the correct user data*/
async function openUserOverlay (overlayUserId) {
    let userdata = await getDataByPromise("SELECT * FROM user WHERE userId = ?", [overlayUserId]);
    let userInterests = await getDataByPromise("SELECT * FROM interests WHERE userId = ?", [overlayUserId]);

    console.log(userdata[0].url)

    //setting the data for in the overlay
    const userUrl = userdata[0].url === "" ? "https://dev-is111-1.fys.cloud/uploads/profile-pictures/default-profile-picture.png" : userdata[0].url;
    const firstName = userdata[0].firstName === "" ? "FirstName" : userdata[0].firstName;
    const lastName = userdata[0].lastName === "" ? "LastName" : userdata[0].lastName;
    const username = userdata[0].username === "" ? "username" : userdata[0].username;
    const bio = userdata[0].bio === "" ? "..." : userdata[0].bio;

    //putting the data in the overlay
    $("#overlay-row-1").html(`<img src="${userUrl}">`);
    $("#overlay-full-name").html(firstName + " " + lastName);
    $("#overlay-username").html("a.k.a. " + username);
    $("#overlay-interests-ul").html("");
    userInterests.forEach(interest => $("#overlay-interests-ul").append("<li>"+ interest.interest +"</li>"));
    $("#overlay-bio").html(bio);

    //displays the overlay and overlay-background
    displayUserOverlay()

    //function to redirect the user to the profilepage
    $("#profile-button").click(function (){redirectToProfileById(overlayUserId)});
}

/** function for opening the overlay */
function displayUserOverlay() {
    $("#overlay").css("display", "flex");
    $("#overlay-background").css("display", "block");
}

/** function to close the active user-display or overlay */
function closeElement (currentDisplay) {
    $("#" + currentDisplay).css("display", "none");
    $("#overlay-background").css("display", "none");
}

/** function that swaps the favorites icon */
function setFavorite (currentIconId, newIconId) {
    $("#" + currentIconId).css("display", "none");
    $("#" + newIconId).css("display", "");
}