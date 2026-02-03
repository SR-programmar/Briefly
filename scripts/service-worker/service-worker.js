// Allows other parts of the extension to access session data
chrome.storage.session.setAccessLevel({
    accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
});

// Listens to keyboard commands (used for testing the service-worker)
chrome.commands.onCommand.addListener(async (command) => {
    // When user presses Ctrl+B
    if (command === "summarize-page") {
        // Prints message alerting that Ctrl+B has been pressed
        logMsg("Pressed Ctrl + B");
    }
});

// This function is used to send messages
async function sendMessage(target, data) {
    const response = await chrome.runtime.sendMessage({
        target: target,
        data: data,
    });

    return response;
}

/**
 * Agent Functions
 * These are functions that are needed when the content scripts cannot perform
 * a certain browser operation. They will send a message to the service
 * worker telling it to execute the specified function
 */

// List Current Tabs
async function listTabs() {
    let tabs = await chrome.tabs.query({});
    return tabs;
}

/**
 * End of Agent Function
 */

// Gets the current tab
async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs[0];
}

// Creates a new tab with the specified url
function createNewTab(url) {
    chrome.tabs.create({ url: url });
}

// Closes the tab the user is currently on
async function closeCurrentTab() {
    let currentTab = await getCurrentTab();
    chrome.tabs.remove(currentTab.id);
}

// Logs a message within the console of the active tab
async function logMsg(msg) {
    let tab = await getCurrentTab();

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (msg) => {
            console.log(msg);
        },
        args: [msg],
    });
}

async function openUrl(url) {
    let tab = await getCurrentTab();

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (url) => {
            window.open(url, "_self");
        },
        args: [url],
    });
}

// Sends a message and payload to the current tab
async function sendContent(payload) {
    let tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id, { target: "agentFunction", data: payload });
}

// Opens side panel globally across windows
function openPanel() {
    chrome.windows.getCurrent((window) => {
        chrome.sidePanel.open({ windowId: window.id });
    });
}

// Handles messages from content scripts
function handleMessage(message, sender, sendResponse) {
    if (message.target === "service-worker") {
        const data = message.data;
        const url = data.url;

        if ("func_message" in data) {
            if (data.func_message === "listTabs") {
                listTabs().then((result) => sendResponse({ tabs: result }));
            }
        } else {
            sendResponse({ response: "Not a function message" });
        }

        if ("purpose" in data) {
            if (data.purpose === "openSidePanel") {
                openPanel();
            } else if (data.purpose === "createNewTab") {
                createNewTab(data.url);
            } else if (data.purpose === "closeCurrentTab") {
                closeCurrentTab();
            } else if (data.purpose === "openUrl") {
                openUrl(data.url);
            } else if (data.purpose === "sendContent") {
                sendContent(data.payload);
            }
        }
    }

    return true;
}

// Adds event listener
chrome.runtime.onMessage.addListener(handleMessage);
