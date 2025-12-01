console.log("Agent Functions script loaded");

function openUrl(url) {
    window.open(url, "_self");
}

function navigateTo(url) {
    window.open(url);
}

async function listTabs() {
    const tabs = await chrome.runtime.sendMessage({ func_message: "listTabs" });
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

document.addEventListener("keydown", async (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "k") {
        openUrl("https://www.example.com");
    }

    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "h") {
        navigateTo("https://www.example.com");
    }

    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "e") {
        await listTabs();
    }
});
