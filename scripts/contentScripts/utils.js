/* 
This file includes functions / variables that several files may rely on
*/

const globalHandler = new TimeOutHandler("F2Held");

function wrp(msg, val) {
    console.log(`${msg} (${val})`);
}

// Waits for a specified amount of time
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
