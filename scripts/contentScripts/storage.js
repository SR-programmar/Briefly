// Retrieves session data with key
async function getSessionData(key) {
    let value = await chrome.storage.session.get([key]);
    return value[key];
}

// Sets session data by key
function setSessionData(key, val) {
    chrome.storage.session.set({ [key]: val });
}

// Sets the state of 'agentActive' to be updated across all tabs
function setAgentOn(state) {
    agentOn = state;
    setSessionData("agentActive", state);
}

// Sets the state of 'extensionActive' to be updated across all tabs
async function setActive(state, ttsMsg) {
    textToSpeech(ttsMsg);
    extensionActive = state;
    setSessionData("extensionActive", state);
}

// Sets local data by key
async function setLocalData(key, val) {
    chrome.storage.local.set({ [key]: val });
}

// Gets local data by key
async function getLocalData(key) {
    let result = await chrome.storage.local.get([key]);
    return result[key];
}

/* 

Checks whether session data hasn't been set, is  programmatically set to "None",
or does have a value.

*/
async function checkSessionData(key) {
    let text = await getSessionData(key);
    if (text === undefined) {
        console.log("Value hasn't been set");
    } else if (text === "None") {
        console.log("Value was reset to None");
    } else {
        console.log("Value: ", text);
        return text;
    }
}
