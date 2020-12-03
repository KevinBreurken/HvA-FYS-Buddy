//clicks on the 'All results' tab so it's open by default
document.getElementById("default-active").click();

//function to switch the tab and active tab-button
function openTabContent (currentButton) {
    const tabButtons = $(".tab-button");

    //swaps the button colors
    for (let i = 0; i < tabButtons.length; i++) {tabButtons[i].style.backgroundColor = "";}
    currentButton.style.backgroundColor = "#c11905";

    //todo: create different query's;
    //1.All results: all results matching the users location, date and gender preference
    //2.Friends
    //3.Friend requests (ingoing)
    //4.Favorites

    FYSCloud.API.queryDatabase(
        "SELECT * FROM user"
    ).done(function(data) {
        $("#tab").html("");
        let userDisplays = [];
        for (let i = 0; i < data.length; i++) {

            const currentDisplayUserId = data[i].userId;  //userId
            const username = data[i].username === "" ? "username" : data[i].username;  //username
            const userUrl = data[i].url === "" ? "https://dev-is111-1.fys.cloud/uploads/profile-pictures/default-profile-picture.png" : data[i].url;  //profile pic
            const location = data[i].location === "" ? "City, Country" : data[i].location; //location

            //start date
            let date = new Date(data[i].startDate);
            const startDate = data[i].startDate === "" ? " " : `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;

            //end date
            date = new Date(data[i].endDate);
            const endDate = data[i].endDate === "" ? " " : `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;

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
            userDisplays[i].setAttribute("id", "user-display-" + currentDisplayUserId);
            $("#tab").append(userDisplays[i]);

            userDisplays[i].innerHTML =
                `<h1 id=user-display-h1-${currentDisplayUserId}>${username}</h1>
            <img class="profile-picture" src="${userUrl}">
            <div>
            <p>${location}</p>
            <p>from ${startDate}</p>
            <p>until ${endDate}</p>
            <p>${buddy}</p>
            </div>
            <div class="tab-content-column-4">
            <button id="button1-${i}" onclick="getOverlayData('${currentDisplayUserId}')">more info</button>
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
    }).fail(function(reason) {
        console.log(reason);
    });
}

//displays the current overlay and the overlay-background
function getOverlayData (currentOverlayUserId) {
    FYSCloud.API.queryDatabase(
        "SELECT * FROM user WHERE userId = ?", [currentOverlayUserId]
    ).done(function(data) {
        //getting data for the overlay
        const userUrl = data[0].url === "" ? "https://dev-is111-1.fys.cloud/uploads/profile-pictures/default-profile-picture.png" : data[0].url;
        const firstName = data[0].firstName === "" ? "FirstName" : data[0].firstName;
        const lastName = data[0].lastName === "" ? "LastName" : data[0].lastName;
        const username = data[0].username === "" ? "username" : data[0].username;
        const bio = data[0].bio === "" ? "..." : data[0].bio;

        $("#overlay-row-1").html(`<img src="${userUrl}">`);
        $("#overlay-full-name").html(firstName + " " + lastName);
        $("#overlay-username").html("a.k.a. " + username);
        $("#overlay-interests").html(data[0].interest);
        $("#overlay-bio").html(bio);

        //geting the interests from the user that needs to be displayed in the overlay
        FYSCloud.API.queryDatabase(
            "SELECT * FROM interests WHERE userId = ?", [currentOverlayUserId]
        ).done(function(interestsData) {
            let userInterest = [];
            interestsData.forEach(element => userInterest.push("<li>"+element.interest+"</li>"));
            $("#overlay-interests-ul").html(userInterest);
        }).fail(function(reason) {
            console.log(reason);
        });

        document.getElementById("overlay").style.display = "flex";
        document.getElementById("overlay-background").style.display = "block";

        //function to redirect the user to the profilepage
        document.getElementById("profile-button").onclick = function (){redirectToProfile(currentOverlayUserId)};
    }).fail(function(reason) {
        console.log(reason);
    });
}

//function to close the active user-display or overlay
function closeFunction (currentDisplay) {
    document.getElementById(currentDisplay).style.display = "none";
    document.getElementById("overlay-background").style.display = "none";
}

//todo: set favorites data in the database when clicking
//function that swaps the favorites icon
function swapFavoritesIcon (currentIconId, newIconId) {
    document.getElementById(currentIconId).style.display = "none";
    document.getElementById(newIconId).style.display = "";
}

//function that redirects the user to the user-profile page
function redirectToProfile(currentOverlayUserId) {
    FYSCloud.URL.redirect("profile.html", {
        id: currentOverlayUserId
    });
}

//todo: set button color depending on if there is an outgoing friend request, the user if friends with the user or no action
//todo: set database data when clicking on the button
//todo: send notification to the other user