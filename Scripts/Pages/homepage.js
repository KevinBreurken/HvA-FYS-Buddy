//clicks on the 'All results' tab so it's open by default
document.getElementById("default-active").click();

//function to switch the tab and active tab-button
function openTabContent (currentButton) {
    let tabButtons = $(".tab-button");
    let tab = $("#tab");

    //swaps the button colors
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].style.backgroundColor = "";
    }
    currentButton.style.backgroundColor = "#c11905";

    FYSCloud.API.queryDatabase(
        "SELECT * FROM user"
    ).done(function(data) {
        tab.html("");
        generateUserDisplays(tab, data);
    }).fail(function(reason) {
        console.log(reason);
    });
}

//generates user-displays
function generateUserDisplays(tab, data) {
    let userDisplays = [];
    for (let i = 0; i < data.length; i++) {

        console.log(data[i])

        let userId = data[i].userId;  //userId
        let username = data[i].username == null ? "username" : data[i].username;  //username
        let userUrl = data[i].url;  //profile pic
        let location = data[i].location == null ? "City, Country" : data[i].location; //location

        //start date
        let date = new Date(data[i].startDate);
        let startDate = data[i].startDate == null
            ? " " : `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;

        //end date
        date = new Date(data[i].endDate);
        let endDate = data[i].endDate == null
            ? " " : `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;

        //type of buddy
        let buddy;
        if (data[i].travelBuddy === 1 && data[i].activityBuddy === 1) {
            buddy = "a buddy";
        } else if (data[i].travelBuddy === 1 && !(data[i].activityBuddy === 1)) {
            buddy = "a travel buddy";
        } else if (!(data[i].travelBuddy === 1) && data[i].activityBuddy === 1) {
            buddy = "an activity buddy";
        } else {
            buddy = " a buddy";
        }

        userDisplays[i] = document.createElement("div");
        userDisplays[i].className = "user-display";
        userDisplays[i].setAttribute("id", "user-display-" + userId);
        tab.append(userDisplays[i]);

        userDisplays[i].innerHTML =
            `<h1 id=user-display-h1-${userId}>${username}</h1>
            <img class="profile-picture" src="${userUrl}">
            <div>
            <p>${location}</p>
            <p>from ${startDate}</p>
            <p>until ${endDate}</p>
            <p>${buddy}</p>
            </div>
            <div class="tab-content-column-4">
            <button id="button1-${i}" onclick="displayOverlay('${userId}')">more info</button>
            <button id="button2-${i}" onclick="closeFunction('user-display-${i}')">X</button>
            <div id="favorite-v1-${i}" onclick="swapFavoritesIcon('favorite-v1-${i}','favorite-v2-${i}')">
            <img class="favorite-icon" src="Content/Images/favorite-v1.png">
            </div>
            <div id="favorite-v2-${i}" style="display: none" onclick="swapFavoritesIcon('favorite-v2-${i}','favorite-v1-${i}')">
            <img class="favorite-icon" src="Content/Images/favorite-v2.png">
            </div>
            </div>
            </div>`;
    }
}

//displays the current overlay and the overlay-background
function displayOverlay (currentUserId) {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM user WHERE userId = ?", [currentUserId]
    ).done(function(data) {
        //todo: add placeholder
        $("#overlay-row-1").html(`<img src="${data[0].url}">`);
        $("#overlay-full-name").html(data[0].firstName + " " + data[0].lastName);
        $("#overlay-username").html("a.k.a. " + data[0].username);
        //todo: fix interests
        $("#overlay-interests").html(data[0].interest);
        $("#overlay-bio").html(data[0].bio);

        document.getElementById("overlay").style.display = "flex";
        document.getElementById("overlay-background").style.display = "block";
    }).fail(function(reason) {
        console.log(reason);
    });
}

//function to close the active user-display or overlay
function closeFunction (currentDisplay) {
    document.getElementById(currentDisplay).style.display = "none";
    document.getElementById("overlay-background").style.display = "none";
}

//function to swap the favorites icon
function swapFavoritesIcon (currentIconId, newIconId) {
    document.getElementById(currentIconId).style.display = "none";
    document.getElementById(newIconId).style.display = "";
}

// //function that swaps the color of the 'send request' button
// function swapColor(button) {
//     button.style.backgroundColor = "var(--color-corendon-dark-red)";
// }

