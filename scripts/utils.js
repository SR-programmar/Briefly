// Global timeHandler
// const globTimeHandler = new TimeOutHandler();

// Waits for a sepcified amount of time
async function Sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// The function used to pass messages to parts of the extension
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
