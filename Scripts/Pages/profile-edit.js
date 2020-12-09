let username = document.querySelector('#Username').value;
let firstname = document.querySelector("#FirstName").value;
let lastname = document.querySelector("#LastName").value;
let dob = document.querySelector("#DateOfBirth").value;
let biography = document.querySelector("#Biography").value;
let email = document.querySelector("#Email").value;
let tel = document.querySelector("#Telephone").value;
let destination = document.querySelector("#Destination").value;
let startdate = document.querySelector("#Data").value;
let enddate = document.querySelector("#Data2").value;

// function profile() {
//     FYSCloud.API.queryDatabase(
//         "INSERT INTO `user` (`id`, `username`, `firstname`, `lastname`, `date_of_birth`, `biography`) VALUES (?, ?, ?, ?, ?, ?)",
//         [3, username, firstname, lastname, dob, biography]
//     ).done(function (data) {
//         console.log(data);
//     }).fail(function () {
//         alert("paniek");
//     });
// }

// let imgLoc;
// $("#fileUpload").on("change", function () {
//     FYSCloud.Utils.getDataUrl($(this)).done(function (data) {
//         if (data.isImage) {
//             $("#imagePreview").attr("src", data.url)
//         } else {
//             $("#imagePreview").attr("src", null,)
//         }
//     }).fail(function (reason) {
//         $("#filePreviewResult").html(reason)
//     })
// })

function profile() {
    FYSCloud.API.queryDatabase(
        "INSERT INTO `user` (`id`, `username`, `email`, `password`) VALUES (NULL, ?, ?, ?)",
        [username, email, password]
    ).done(function (data) {
        let photoId = data.insertId
        imageUpload(photoId)
        FYSCloud.API.queryDatabase(
            "INSERT INTO `profile` (`id`, `firstname`, `lastname`, `gender`, `dob`, `phone`, `biography`, `pictureUrl`) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [data.insertId, firstname, lastname, gender, dob, tel, biography, "pp-" + data.insertId + ".jpg"]
        ).done(function (data) {
            loginUser(data.insertId)
        }).fail(function (reason) {
            console.log(reason)
        })
    }).fail(function (reason) {
        console.log(reason)
    })
}

// FYSCloud.API.queryDatabase(
//     "UPDATE `` SET `` WHERE `` `userId` = ?;",
//     [currentUser]
// ).done(function() {
//     console.log(data);
// }).fail(function (reason) {
//     console.log(reason);
// });

let userId = getCurrentUserID();
FYSCloud.API.queryDatabase(
    "SELECT * FROM user where id = ?", [userId]
).done(function (data) {
    console.log(data);
    let userData = data[0];
     $("#Email").val(userData.email);
     $("#Username").val(userData.username);
}).fail(function () {
    alert("paniek");
});

FYSCloud.API.queryDatabase(
    "SELECT * FROM profile where id = ?", [userId]
).done(function (data) {
    console.log(data);
    let userData = data[0];
    let gendertest = userData.gender;
    if(gendertest === "male") {
        document.getElementById("Male").checked = true;
    } else if (gendertest === "female") {
        document.getElementById("Female").checked = true;
    } else {
        document.getElementById("Other").checked = true;
    }
    $("#FirstName").val(userData.firstname);
    $("#LastName").val(userData.lastname);
    $("#DateOfBirth").val(userData.dob);
    $("#Biography").val(userData.biography);
    $("#Telephone").val(userData.phone);
}).fail(function () {
    alert("paniek");
});
