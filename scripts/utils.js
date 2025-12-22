function wrp(msg, val) {
    console.log("${msg} (${val})");
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

// While an asynchronous operation is ongoing, it will repeat
// play an indicator sound that it's still pending
/** This function doesn't work */
async function waitForTask(response, alertEffect) {
    console.log(`(${response.content})`);
    while (response.toString() === "") {
        await Sleep(3000);
        if (response.content != "") {
            break;
        } else {
            console.log(`Hi (${response.content})`);
            alertEffect();
        }

        await Sleep(3000);
    }

    return true;
}
