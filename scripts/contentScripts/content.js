/*

This script is where all of the app's main functionality is held
It listens for keyboard commands and clicks to determine what the user
wants to do.
It relies on several functions/classes from other files

*/

console.log("Content.js Script injected into tab");

/* ========================= Variables ================================== */

const summaryLengths = ["Medium", "Short", "Two-Sentence", "Long"];
const summaryTypes = ["general", "research", "paragraph", "learn"];
// Summarized Content
let summarizedContent = "";
let loadContent;

// State of extension
let extensionActive;

// Checks how many times user pressed Control
let timesControlPressed = 0;

// Boolean tells if screen reader is active or not
let screenReaderActive = false;
let agentOn = false;
let allowShift = false;

// To Handle AI Agent audio input functionality
let keyWasHeld = false;

/* ========================= End of Variables ================================== */

/* ======================== *** Functions *** =============================== */

// Shifts an array
function shiftArr(arr, msg) {
    arr.unshift(arr[arr.length - 1]);
    arr.pop();
    textToSpeech(`${msg} ${arr[0]}`);
}

/* ========> Summary functions <======== */

/* Waits for summarizeContent to be finished,
 * and then sets summarizedContent
 *   to the response */
async function createSummary() {
    await summarizeContent(summaryLengths[0], summaryTypes[0]).then(
        (result) => {
            summarizedContent = result;
        },
    );

    return "Success";
}

// Plays summary with short indicator
async function playSummary() {
    playStartEffect();
    await Sleep(500);
    textToSpeech("Starting Summary");
    await Sleep(1500);

    /** Waiting for summary */
    while (summarizedContent === "" && screenReaderActive) {
        await Sleep(3000);
        if (summarizedContent != "") {
            break;
        } else {
            playAlertEffect();
        }

        await Sleep(3000);
    }

    loadContent.then(() => {
        if (screenReaderActive) {
            console.log("*** Summary ***");
            console.log(`*** Mode: ${summaryLengths[0]}\n\n ***`);
            textToSpeech(summarizedContent);
            summarizedContent = "";
            screenReaderEnd(() => {
                screenReaderActive = false;
            });
        }
    });
}

/* ========> End of Summary functions <======== */

/* ========> Functions <======== */

function asyncVarValues() {
    // Sets the state of 'extensionActive' when user opens new URL
    getSessionData("extensionActive").then((result) => {
        extensionActive = result.extensionActive;
    });

    getSessionData("agentActive").then((result) => {
        agentOn = result.agentActive;
    });
}

/* ========> Functions <======== */
/* ========================= End of Functions ================================== */

asyncVarValues();

/* ========================= Event Listeners ================================== */

/* ========> Key Up <======== */
document.addEventListener("keyup", () => {
    globalHandler.clearTime("F2Held");
    keyWasHeld = false;
});

/* ========> End of Key Up <======== */

/* ========> Key Down <======== */
document.addEventListener("keydown", (event) => {
    /* Ctrl + Shift */
    console.log("===================================================");
    if (event.ctrlKey && event.shiftKey) {
        /* The browser requires a user gesture meaning they must 'click'
        on the page some where */
        allowShift = false;

        if (navigator.userActivation.hasBeenActive) {
            if (!extensionActive) {
                setActive(true, "Activated");
                sendMessage("service-worker", { purpose: "openSidePanel" });
            } else if (extensionActive) {
                setActive(false, "Deactivated");
            }
        } else {
            // With hasBeenActive, we may remove this portion of code later
            let activation = extensionActive ? "deactivate" : "activate";
            textToSpeech(
                `We are terribly sorry, you need to interact with the page with your mouse or keyboard once in order for Briefly to ${activation}`,
            );
            console.log(`***** Not activated *****`);
        }
        console.log("*** Pressed Shift + Ctrl ***");
    }

    // Debugging
    console.log(`Extension Active: ${extensionActive}`);
    console.log(`Agent active: ${agentOn}`);

    /* Extension Keyboard Commands */
    if (extensionActive) {
        /* F2 */
        // Checks if user holds down F2 for at least 1 second to trigger Agent
        if (event.key === "F2") {
            if (!keyWasHeld) {
                globalHandler.setTime(
                    "F2Held",
                    () => {
                        sendMessage("sidePanel", {
                            purpose: "startAgent",
                        });
                    },
                    1,
                );
            }
            keyWasHeld = true;
        }

        /* Escape */
        // Stop conversation with agent
        if (event.key === "Escape" && agentOn) {
            sendMessage("sidePanel", { purpose: "stopAgent" });
            setAgentOn(false);
        }

        if (event.key === "Shift" && allowShift) {
            // Shifts the summaryLengths array
            shiftArr(summaryLengths, "selected length:");
        }

        allowShift = true;

        /* Control */
        // Play Summarizer if Control is pressed 3 times
        if (event.key === "Control") {
            if (screenReaderActive) {
                stopScreenreader();
                timesControlPressed = 0;
            } else {
                timesControlPressed++;

                // Resets times pressed if they don't press again in 1.5 seconds
                if (timesControlPressed == 1) {
                    setTimeout(() => {
                        timesControlPressed = 0;
                    }, 1500);
                }
            }

            if (timesControlPressed === 3) {
                if (!screenReaderActive) {
                    screenReaderActive = true;

                    /* Create summary is called early to have it be ready sooner */

                    loadContent = createSummary();

                    playSummary();
                }
            }

            if (agentOn) {
                sendMessage("sidePanel", { purpose: "interruptAgent" });
            }
        }

        /* CapsLock */
        // Pauses screen reader
        if (event.key === "CapsLock") {
            if (!screenReaderActive && !agentOn) {
                shiftArr(summaryTypes, "selected summary type: ");
            }

            if (screenReaderActive) {
                pauseScreenReader();
            } else if (agentOn) {
                sendMessage("sidePanel", { purpose: "pauseAgent" });
            }
        }
    }

    console.log(timesControlPressed, screenReaderActive, event.key); // Debugging
});

/* ========> End of Key Down <======== */

/* ========================= Event Listeners ================================== */

/* This code ensures that all content scripts update the state of
'extensionActive' to avoid bugs */
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log("Key", key);

        if (key === "extensionActive") {
            extensionActive = newValue;
            console.log("Extension active set to ", extensionActive);
        }

        if (key === "agentActive") {
            agentOn = newValue;
            console.log("Agent active set to ", agentOn);
        }
    }
});

/* ========================= End of Event Listeners ================================== */
