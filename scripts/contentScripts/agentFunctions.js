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

// Searches through anchor tags that match the "text" arg
function searchElements(text) {
    console.log("Searching interactive elements...");

    const elements = document.querySelectorAll("a, button");

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].innerText.toLowerCase().includes(text.toLowerCase())) {
            return elements[i];
        }
    }

    console.log(`${text}: Not found`);
    return undefined;
}

// Clicks an anchor tag or button element on the screen
function clickElement(element) {
    if (element != undefined) {
        console.log(element);
        element.click();
    }
}

// Used to interact with an element on the page. Modified to work with navigateTo and openURL
function clickInteractive(text, args) {
    if (Object.hasOwn(args, "url")) {
        console.log("Args contains url");
        setSessionData("clickElementText", text);
    } else {
        console.log("Message sent!");
        sendMessage("service-worker", {
            purpose: "sendContent",
            payload: { purpose: "clickElement", text: text },
        });
    }
}

// Handles messages from agentFunctions script
function agentFunctionMessageHandler(message, sender, sendResponse) {
    console.log(message);
    if (message.target === "agentFunction") {
        const data = message.data;

        if ("purpose" in data) {
            if (data.purpose === "tabReady") {
                checkSessionData("clickElementText").then((r) => {
                    if (r != undefined) {
                        console.log(searchElements(r));
                        clickElement(searchElements(r));
                        setSessionData("clickElementText", "None");
                    }
                });
            } else if (data.purpose === "clickElement") {
                clickElement(searchElements(data.text));
            }
        }
    }
}

// Adds event listener
chrome.runtime.onMessage.addListener(agentFunctionMessageHandler);
