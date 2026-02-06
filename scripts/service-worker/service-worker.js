// Allows other parts of the extension to access session data
chrome.storage.session.setAccessLevel({
    accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
});

// This function is used to send messages
async function sendMessage(target, data) {
    const response = await chrome.runtime.sendMessage({
        target: target,
        data: data,
    });

    return response;
}

// Sets session data by key
function setSessionData(key, val) {
    chrome.storage.session.set({ [key]: val });
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

// Gets the current tab
async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs[0];
}

// Opens side panel globally across windows
function openPanel() {
    try {
        chrome.windows.getCurrent((window) => {
            chrome.sidePanel.open({ windowId: window.id });
        });
        setSessionData("panelOpen", true);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Agent Functions
 * These are functions that are needed when the content scripts cannot perform
 * a certain browser operation. They will send a message to the service
 * worker telling it to execute the specified function
 */

// Returns a list of all the tabs open
async function listTabs() {
    let tabs = await chrome.tabs.query({});
    return tabs;
}

// Opens the specified URL in the current active tab
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

/**
 * End of Agent Function
 */

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
            }
        }
    }

    return true;
}

// Adds event listener
chrome.runtime.onMessage.addListener(handleMessage);
