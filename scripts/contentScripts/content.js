/*

This script is where all of the app's main functionality is held
It listens for keyboard commands and clicks to determine what the user
wants to do.
It relies on several functions/classes from other files

*/

/* ========================= Variables ================================== */

console.log("Content.js Script injected into tab");

const summaryModes = ["Medium", "Short", "Two-Sentence", "Long"];
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

// To Handle AI Agent audio input functionality
let startTime;
let keyWasHeld = false;

/* ========================= End of Variables ================================== */

/* ======================== *** Functions *** =============================== */

/* ========> Summary functions <======== */

/* Waits for summarizeContent to be finished,
 * and then sets summarizedContent
 *   to the response */
async function createSummary() {
    await summarizeContent(summaryModes[0]).then((result) => {
        summarizedContent = result;
    });

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
            console.log(`*** Mode: ${summaryModes[0]}\n\n ***`);
            textToSpeech(summarizedContent);
            summarizedContent = "";
            screenReaderEnd(() => {
                screenReaderActive = false;
            });
        }
    });
}

/* ========> End of Summary functions <======== */

/* ========> Session Data Functions <======== */

function asyncVarValues() {
    // Sets the state of 'extensionActive' when user opens new URL
    getSessionData("extensionActive").then((result) => {
        extensionActive = result.extensionActive;
    });

    getSessionData("agentActive").then((result) => {
        agentOn = result.agentActive;
    });
}

/* ========> End of Session Data Functions <======== */

/* ========================= End of Functions ================================== */

asyncVarValues();

/* ========================= Event Listeners ================================== */

/* ========> Key Up <======== */
document.addEventListener("keyup", () => {
    let timeHeld = new Date().getSeconds() - startTime;
    keyWasHeld = false;
    startTime = undefined;

    if (timeHeld >= 1) {
        sendMessage("sidePanel", {
            purpose: "startAgent",
        });

        console.log("F2 was held for", timeHeld, "seconds");
    }
});

/* ========> End of Key Up <======== */

/* ========> Key Down <======== */
document.addEventListener("keydown", (event) => {
    /* Ctrl + Shift */
    if (event.ctrlKey && event.shiftKey) {
        /* The browser requires a user gesture meaning they must 'click'
        on the page some where */
        if (navigator.userActivation.isActive) {
            if (extensionActive === undefined) {
                sendMessage("service-worker", { purpose: "createSessionData" });
            } else if (!extensionActive) {
                setActive(!extensionActive, "Activated");
                sendMessage("service-worker", { purpose: "openSidePanel" });
            } else if (extensionActive) {
                setActive(!extensionActive, "Deactivated");
            }
        } else {
            textToSpeech(
                "We're terribbly sorry, you need to click the screen with your mouse once in order for Blind Time to activate"
            );
            console.log(`***** Not activated *****`);
        }
    }

    // Debugging
    console.log(`Extension Active: ${extensionActive}`);
    console.log(`Agent active: ${agentOn}`);

    /* Extension Keyboard Commands */
    if (extensionActive) {
        /* F2 */
        // Checks if user holds down F2 for atleast 1 second to trigger Agent
        if (event.key === "F2") {
            if (!keyWasHeld) {
                startTime = new Date().getSeconds();
                keyWasHeld = true;
            }
        }
        /* Shift */
        if (event.key === "Shift") {
            // Shifts the summaryModes array
            summaryModes.unshift(summaryModes[summaryModes.length - 1]);
            summaryModes.pop();

            textToSpeech(`Selected mode: ${summaryModes[0]}`);
        }

        /* Escape */
        // Stop conversation with agent
        if (event.key === "Escape" && agentOn) {
            sendMessage("sidePanel", { purpose: "stopAgent" });
            setAgentOn(false);
        }

        /* Control */
        // Play Summarizer if Control is pressed 3 times
        if (event.key === "Control") {
            if (screenReaderActive) {
                stopScreenreader();
                timesControlPressed = 0;
                playStopEffect();
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
                textToSpeech("Interrupted, now listening");
            }
        }

        /* CapsLock */
        // Pauses screenreader
        if (event.key === "CapsLock") {
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

/** User gesture is required for extension to play audio or
 * open side panel
 */

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

/* ========================= Event Listeners ================================== */
