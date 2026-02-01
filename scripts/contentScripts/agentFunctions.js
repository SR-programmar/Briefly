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

function searchElements(text) {
    console.log("Searching interactive elements...");

    const elements = document.querySelectorAll("a, button");

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].innerText.toLowerCase().includes(text.toLowerCase())) {
            return elements[i];
        }
    }
}

function clickElement(element) {
    element.click();
}

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "l") {
        clickElement(searchElements("machine learning"));
    }
});
