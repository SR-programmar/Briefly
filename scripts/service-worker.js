// Listens to keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    // When user presses Ctrl+B
    if (command === "summarize-page") {
        // Prints message alerting that Ctrl+B has been pressed
        logMsg("Pressed Ctrl + B");
    }
});

// This function is used to send messages and is only used within this scripts
async function sendMessage(target, data) {
    if (target === "offScreen") {
        await setUpOffScreen();
    }

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

/**
 * Sends a message to target
 */

// Creates an offscreen document with specified path
async function createOffScreenDoc(path) {
    const just = `The extension needs 
    audio from the user's microphone so 
    it can interact with an AI Agent, 
    that can answer their questions and perform browser operations`;

    await chrome.offscreen.createDocument({
        url: path,
        reasons: ["USER_MEDIA", "BLOBS"],
        justification: just,
    });
}

// Creats an offscreen document if it already doesn't exist
async function setUpOffScreen() {
    const path = "pages/audioRetriever.html";

    let docURL = chrome.runtime.getURL(path);

    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"],
        documentUrls: [docURL],
    });

    if (existingContexts.length > 0) {
        return;
    }

    await createOffScreenDoc(path);
}

// Creates session data
function createSessionData() {
    chrome.storage.session.set({ extensionActive: false }).then(() => {
        console.log("Value was set");
    });

    chrome.storage.session.setAccessLevel({
        accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
    });
}

// Gets a specified session data by key
function getSessionData(key) {
    let theResult;
    chrome.storage.session.get([key]).then((result) => {
        console.log("Value is " + result.key);
        theResult = result;
    });

    return theResult;
}

// Gets the current tab
async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs[0];
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

/* Executes a function in the current tab and returns 'true'
if no errors were present
*/
async function executeOnTab(callBack) {
    let tab = await getCurrentTab();
    let status = "Success";

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: callBack,
    });

    return status;
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
            }
        }
    }

    return true;
}

// Adds event listener
chrome.runtime.onMessage.addListener(handleMessage);
createSessionData();
