/* 
This file includes functions / variables that several files may rely on
*/

const globalHandler = new TimeOutHandler("F2Held");

// Shifts an array
function shiftArr(arr, msg) {
    arr.unshift(arr[arr.length - 1]);
    arr.pop();
    textToSpeech(`${msg} ${arr[0]}`);
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
