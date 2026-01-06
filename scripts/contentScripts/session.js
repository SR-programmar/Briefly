// Retrieves session data with key
async function getSessionData(key) {
    let value = await chrome.storage.session.get([key]);
    return value;
}

// Sets session data by key
function setSessionData(key, val) {
    chrome.storage.session.set({ [key]: val });
}

// Sets the session data 'agentActive' to 'state' across all tabs
function setAgentOn(state) {
    agentOn = state;
    setSessionData("agentActive", state);
}

// Changes session data of 'extensionActive'
async function setActive(state, ttsMsg) {
    textToSpeech(ttsMsg);
    extensionActive = undefined;

    setSessionData("extensionActive", state);
}
