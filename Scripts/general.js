//Load Translations
FYSCloud.Localization.CustomTranslations.loadJSONTranslationFile("Content/Translations/header-translation.json");
FYSCloud.Localization.CustomTranslations.loadJSONTranslationFile("Content/Translations/footer-translation.json");
//Add header and footer css to <head>.
$("head").append('<link rel="stylesheet" href="Content/CSS/header.css">');
$("head").append('<link rel="stylesheet" href="Content/CSS/footer.css">');
// "is a shorthand for : $(document).ready(function() { ... });"
$(function () {
    //Add to header the start of the body.
    $.get("Views/general-header.html", function (data) {
        $("header").prepend($(data));
        $("head").append('<script src="Scripts/header.js"></script>');
    });
    //Add footer to the end of the body.
    $.get("Views/general-footer.html", function (data) {
        $("body").append($(data));
        $("head").append(`<script src="Scripts/footer.js"></script>`);
    });
});