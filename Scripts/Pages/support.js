var settingsTranslation = {
    support: {
        head: {
            nl: "Ondersteuning",
            en: "Support"
        },
        content1: {
            nl: "FAQ",
            en: "FAQ",
            card1: {
                nl: "Wat is Fasten Your Seatbelts?",
                en: "What is Fasten Your Seatbelts?",
                paragraph: {
                    nl: "Fasten Your Seatbelts (FYS is het kort), is de naam von dit project and word uitgevoerd namens Corendon, een Nederlandse vakantie en vlucht verkoper. ",
                    en: "Fasten Your Seatbelts (or also known as FYS for short), is the name of this project and is carried out on behalf of Corendon, a Dutch holding specialized in flight holidays."
                }
            },
            card2: {
                nl: "Wat is het hoofddoel van Fasten Your Seatbelts?",
                en: "What is the main goal of the Fasten Your Seatbelts project?",
                paragraph: {
                    nl: "Het idee van dit project is dat eenzame rezigers met andere andere eenzame reizigers om zo de mensen dichter bijelkaar te brengen. ",
                    en: "The purpose of the development of the Fasten Your Seatbelts project is to bring single people together allowing for traveling in groups rather than alone."
                }
            },
            card3: {
                nl: "Hoe kan ik contact opnemen met Corendon?",
                en: "How can I reach out to Corendon?",
                paragraph: {
                    nl: "Corendon heeft zijn gehele eigen website waar contact met hen kan opnemen. ",
                    en: "Corendon has its own website containing all of the information related to contact. Please refer to their main website at: https://www.corendon.nl/contact."
                }
            }

        },
        content2: {
            nl: "Applicatie uitleg",
            en: "Application guide",
            subText: {
                nl: "Hier word uitgelegd hoe je door de website kan navigeren. ",
                en: "In this section will be explained how to navigate through the application as well as its available features. "
            },
            card1: {
                nl: "Navigigatie",
                en: "Navigation",
                paragraph: {
                    nl: "Het is mogelijk om door de pagina te navigeren via de navigatie knoppen bovenaan op het scherm. Onder het Corendon logo. ",
                    en: "Navigation is possible through taking a look at the available navigation buttons located at the top side of the screen (next to the Corendon banner). "
                }
            },
            card2: {
                nl: "Wat is het koppel systeem? ",
                en: "What is the matching system? ",
                paragraph: {
                    nl: "De applicatie geeft de mogelijkheid om andere reizigeres te zoeken met overeenkomende interesses die mogelijk een match kunnen worden. ",
                    en: "The application allows for search of other travelers who might have similar interests and might potentially be a match. "
                }
            },
            card3: {
                nl: "Wat zijn de koppel filters? ",
                en: "What are the matching filters? ",
                paragraph: {
                    nl: "Met onze zoekfunctie kan je gemakkelijk filteren op afstand en 'buddy' type. ",
                    en: "The search can be specified by applying different kinds of filters which can be displayed by pressing on the filters button located at the top right. "
                }
            },
            card4: {
                nl: "Waar kan ik mensen vinden die overeenkomende interesses hebben? ",
                en: "Where can I find people that match with my interests?",
                paragraph: {
                    nl: "Een koppeling word getoont op onze hoofd pagina en daar kunt je een reiziger selecteren",
                    en: "A traveler who's profile matches, might be selected down below. "
                }
            },
            card5: {
                nl: "Waar kan ik de informatie vinden over mijn koppelingen? ",
                en: "Where can I find the information related to other people such as interests? ",
                paragraph: {
                    nl: "Elke reiziger die op de hoofdpagina staan zijn klikbaar en daar zal je extra informatie over diegene vinden. ",
                    en: "Each traveler has his or her own description in relation to their location, available dates, activities and other useful data. This information can be found within each of the cards down below. "
                }
            }
        }
    }
}

FYSCloud.Localization.CustomTranslations.addTranslationJSON(settingsTranslation)

// TODO: Enable following once login system has been implemented:
// let userId = FYSCloud.Session.get("userId");
//
// if(userId === undefined) {
//     window.location.href = "index.html";
// }

// Collapsible block elements:
const coll = document.querySelectorAll(".collapsible");
for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        let content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

// When clicking back button:
document.querySelector(".support-controls button#back").addEventListener("click", function () {
    window.location.href = "index.html";
});