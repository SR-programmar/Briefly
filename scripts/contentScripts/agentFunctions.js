// Opens a url in the current tab
function openUrl(url) {
    sendMessage("service-worker", { purpose: "openUrl", url: url });
}

// Opens a url in a new tab
function navigateTo(url) {
    window.open(url);
}

// Lists all tabs that are currently opened
async function listTabs() {
    const tabs = await sendMessage("service-worker", {
        func_message: "listTabs",
    });
    let tabTitles = [];

    for (let i = 0; i < tabs.tabs.length; i++) {
        tabTitles.push(tabs.tabs[i].title);
    }

    let tabsText = "";
    for (let i = 0; i < tabTitles.length; i++) {
        tabsText += `${i + 1}. ${tabTitles[i]}\n`;
    }
    textToSpeech("Here are all the tabs: " + tabsText);
}

/* Searches through all anchor and button tags to find element with
matching text */
function searchElements(text) {
    console.log("Searching interactive elements...");

    const elements = document.querySelectorAll("a, button");

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].innerText.toLowerCase().includes(text.toLowerCase())) {
            return elements[i];
        }
    }
}

// Clicks a button or anchor tag on the screen
function clickElement(element) {
    element.click();
}

// Testing
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "l") {
        sendMessage("service-worker", {
            purpose: "createNewTab",
            url: "pages/instructions.html",
        });
    }
});
