/* 
Logging strings to check their value can be difficult
if they contain trailing whitespace or are empty strings.
This log prints them wrapped around parantheses to tackle
this issue.
*/
function wrp(msg, val) {
    console.log(`${msg} (${val})`);
}

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
