function changeButton() {
    document.getElementById('match').value = "Requested";
}

function changeButton2() {
    document.getElementById('block').value = "Blocked";
}

function AgeCheck() {
    const MIN_AGE = 18;
    const MAX_AGE = 100;

    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear() - MIN_AGE;
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = yyyy + '-' + mm + '-' + dd;

    let ageCheck = new Date();
    let day = ageCheck.getDate();
    let month = ageCheck.getMonth() + 1;
    let year = ageCheck.getFullYear() - MAX_AGE;
    if (day < 10) {
        day = '0' + day
    }
    if (month < 10) {
        month = '0' + month
    }
    ageCheck = year + '-' + month + '-' + day;
    // TODO: fix bug.
//document.getElementById("dateOfBirth").setAttribute("max", today);
//document.getElementById("dateOfBirth").setAttribute("min", ageCheck);
}

let count;
function countCharacters() {
    var textEntered, countRemaining, counter;
    textEntered = document.getElementById('biography').value;
    counter = (500- (textEntered.length));
    countRemaining = document.getElementById('charactersRemaining');
    countRemaining.textContent = counter;
}
//count = document.getElementById('biography');
//count.addEventListener('keyup', countCharacters, false);
//let userId5 = getCurrentUserID();

let userId = getCurrentUserID();
    FYSCloud.API.queryDatabase(
        "SELECT * FROM profile where id = ?", [userId]
    ).done(function (data) {
        console.log(data);
        generateProfileDisplay(data);
        generateBuddy(data);
    }).fail(function () {
        alert("paniek");
    });

FYSCloud.API.queryDatabase(
    "SELECT * FROM user where id = ?", [userId]
).done(function (data) {
    console.log(data);
    generateUserinfo(data);
}).fail(function () {
    alert("paniek");
});

FYSCloud.API.queryDatabase(
    "SELECT * FROM travel where id = ?", [userId]
).done(function (data) {
    console.log(data);
    generateTravelInfo(data);
}).fail(function () {
    alert("paniek");
});

FYSCloud.API.queryDatabase(
    "SELECT `destination` FROM location where id = ?", [userId]
).done(function (data) {
    console.log(data);
    generateDestination(data);
}).fail(function () {
    alert("paniek");
});

FYSCloud.API.queryDatabase(
    "SELECT * FROM userinterest where userId = ?", [userId]
).done(function (data) {
    console.log(data);
    generateInterests(data);
}).fail(function () {
    alert("paniek");
});

function generateProfileDisplay(data) {
    let userData = data[0];
    let url = userData.pictureUrl === "" ? "https://dev-is111-1.fys.cloud/uploads/profile-pictures/default-profile-picture.png" : userData.pictureUrl;
    let firstname = userData.firstname == null ? "" : userData.firstname;
    let lastname = userData.lastname == null ? "" : userData.lastname;
    let gender = userData.gender == null ? "" : userData.gender;
    let date = new Date(userData.dob);
    let dob = userData.dob == null ? "" : `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    let ageBerekening = new Date().getFullYear() - date.getFullYear();
    let age = userData.dob == null ? "" : ageBerekening;
    let biography = userData.biography == null ? "" : userData.biography;
    let tel = userData.phone == null ? "" : userData.phone;

    $("#img").attr("src",  "https://dev-is111-1.fys.cloud/uploads/profile-pictures/" + url);
    $("#firstname").html("<b>First name: </b>" + firstname);
    $("#lastname").html("<b>Last name: </b>" + lastname);
    $("#gender").html(gender);
    $("#age").html("<b>Age: </b>" + age);
    $("#dob").html("<b>Date of birth: </b>" + dob);
    $("#biography").html(biography);
    $("#tel").html("<b>Tel: </b>" + tel);
}
function generateTravelInfo(data) {
    let userData = data[0];

    date = new Date(userData.startdate);
    let start_date = userData.startdate == null ? "" : `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;

    date = new Date(userData.enddate);
    let end_date = userData.enddate == null ? "" : `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    $("#from").html("<b>From: </b>" + start_date);
    $("#untill").html("<b>Untill: </b>" + end_date);
}

function generateUserinfo(data) {
    let userData = data[0];
    let username = userData.username == null ? "" : userData.username;
    let email = userData.email == null ? "" : userData.email;
    $("#username").html("<b>Username: </b>" + username);
    $("#usernameTitle").html(username);
    $("#email").html("<b>E-mail: </b>" + email);
}

function generateBuddy(data) {
    let userData = data[0];
    let buddy;
    if (userData.buddyType === 1) {
        buddy = "a buddy";
        $("#lookingFor").html("<b>I am looking for: </b>" + buddy);
    } else if (userData.type === 2) {
        buddy = "an activity buddy"
        $("#lookingFor").html("<b>I am looking for: </b>" + buddy);
    } else if (userData.type === 3) {
        buddy = "a travel buddy"
        $("#lookingFor").html("<b>I am looking for: </b>" + buddy);
    }
}

function generateDestination(data) {
    let userData = data[0];
    let destination = userData.destination == null ? "" : userData.destination;
    $("#destination").html("<b>Destination: </b>" + destination);
}

function generateInterests(data) {
    for (let i = 0; i < data.length; i++) {
        $("#interests").append("<div style='color: var(--color-corendon-white);\n" +
            "    background-color: var(--color-corendon-red);\n" +
            "    display: inline-block;\n" +
            "    padding: .25em .4em;\n" +
            "    font-size: 75%;\n" +
            "    font-weight: 700;\n" +
            "    line-height: 1;\n" +
            "    text-align: center;\n" +
            "    white-space: nowrap;\n" +
            "    vertical-align: baseline;\n" +
            "    border-radius: .25rem;\n" +
            "    margin: 2px;'>" + data[i].interestId + "<div>");
    }
}

let imgLoc;
$("#fileUpload").on("change", function () {
    FYSCloud.Utils.getDataUrl($(this)).done(function (data) {
        if (data.isImage) {
            $("#imagePreview").attr("src", data.url)
        } else {
            $("#imagePreview").attr("src", null,)
        }
    }).fail(function (reason) {
        $("#filePreviewResult").html(reason)
    })
})

$.getJSON("https://api.ipify.org?format=json", function(data) {
    $("#rightbox").html(data.ip);
})

let current = new Date();
let currentdate = current.getFullYear() +"-" + (current.getMonth() + 1) + "-" + current.getDate();
let currenttime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
let datetime = currentdate + " " + currenttime;

$("#leftbox").html(datetime);

var profileTranslation = {
    profile: {
        username: {
            nl: "<b>Gebruikersnaam: </b>",
            en: "<b>Username:</b> "
        },
        firstname: {
            nl: "<b>Voornaam: </b>",
            en: "<b>First name: </b>"
        },
        lastname: {
            nl: "<b>Achternaam: </b>",
            en: "<b>Last name: </b>"
        },
        gender: {
            nl: "<b>Geslacht</b>",
            en: "<b>Gender</b>"
        },
        age: {
            nl: "<b>Leeftijd: </b>",
            en: "<b>Age: </b>"
        },
        dob: {
            nl: "<b>Geboortedatum: </b>",
            en: "<b>Date of Birth: </b>"
        },
        destination: {
            nl: "<b>Bestemming: </b>",
            en: "<b>Destination: </b>"
        },
        from: {
            nl: "<b>Van: </b>",
            en: "<b>From: </b>"
        },
        untill: {
            nl: "<b>Tot</b>",
            en: "<b>Untill: </b>"
        },
        lookingfor: {
            nl: "<b>Opzoek naar: </b>",
            en: "<b>I am looking for: </b>"
        }

    }

};

$(function () {
    FYSCloud.Localization.CustomTranslations.addTranslationJSON(profileTranslation);
});

// TODO: make translation language dynamic.
// document.addEventListener("languageChangeEvent", function (event) {
//     console.log(event.detail.id);
//     let newString = FYSCloud.Localization.Buddy.addTranslationJSON("profile.username");
//     newString = newString.replace("");
// });

// TODO: get the id from url for profile display.
// //get the url
// var pageUrl = window.location.href;
//
// //split at the userId
// var array1 = pageUrl.split("id=");
//
// console.log("this is the first part of the array " + array1[0]);
// console.log("this is the second part of the array " + array1[1]);
//
// //if there's more after the id=1 do:
// // var arra2 = array1[1].split("1");
// // //arra 2 = id
//
// FYSCloud.API.queryDatabase(
//     "SELECT * FROM user WHERE userId = ?", [array1[1]]
// ).done(function(data) {
//
// }).fail(function(reason) {
//     console.log(reason);
// });