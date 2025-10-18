

const GOG_URL_REGEX = /https:\/\/www\.gog\.com\/[^/]+\/game\/[^/]+/;
const BUTTON_CLASS_NAME = "button button--big install-button ng-scope ng-hide";

function IsOnGoG() {
    return GOG_URL_REGEX.test(window.location.href);
}

const GameName = window.location.pathname.toString().split("/").pop()

async function Check_Game_Dispo() {
    const response = await chrome.runtime.sendMessage({
        action: "checkAvailability",
        slug: GameName
    });
    return response.available;
}


async function DoYourJob() {
    const Game_is_available = await Check_Game_Dispo()
    console.log(Game_is_available)
    const buttons = document.getElementsByClassName(BUTTON_CLASS_NAME);
    if (Game_is_available) {
        buttons[0].addEventListener("click", (e) => {
            window.open(`https://gog-games.to/game/${GameName}`)
        })
        buttons[0].classList.remove("ng-hide");
    } else {
        buttons[0].textContent = "Not available for download on gog-games.to"
        buttons[0].style.cursor = "not-allowed"
        buttons[0].classList.remove("ng-hide");
    }

}

if (IsOnGoG()) {
    window.addEventListener("load", DoYourJob);
}


