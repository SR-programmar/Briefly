/*

This script is what utilizes the software's entire functionality.
It listens for keyboard commands to determine what the user
wants to do.
It relies on several functions/classes from other files

*/

console.log("Content.js Script injected into tab");

/* ========================= Variables ================================== */

// Different lengths that summary could be
const summaryLengths = ["Medium", "Short", "Two-Sentence", "Long"];
// Different types of summaries, used to suit user preference
const summaryTypes = ["general", "research", "paragraph", "learn"];
// Summarized Content
let summarizedContent = "";
let loadContent;

// State of extension
let extensionActive;
// State of side panel
let panelOpen;

// Checks how many times user pressed Control
let timesControlPressed = new TimesPressed(3);
let timesShiftPressed = new TimesPressed(3);
// Boolean tells if screen reader is active or not
let screenReaderActive = false;
// State of Agent
let agentOn = false;
let allowShift = false;

// To Handle AI Agent audio input functionality
let keyWasHeld = false;

/* ========================= End of Variables ================================== */

/* ======================== *** Functions *** =============================== */

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
}

// Plays summary with short indicator
async function playSummary() {
    playStartEffect();
    await Sleep(500);
    textToSpeech("Starting Summary");
    await Sleep(1500);
    let timesWaited = 0;

    /** Waiting for summary */
    while (summarizedContent === "" && screenReaderActive) {
        await Sleep(3000);
        if (summarizedContent != "") {
            break;
        } else if (timesWaited > 3) {
            stopScreenreader(
                "The server didn't respond in time. Please try again.",
            );
            break;
        } else {
            playAlertEffect();
        }

        timesWaited++;

        await Sleep(3000);
    }

    loadContent.then(() => {
        if (screenReaderActive) {
            // Debugging and testing
            console.log("*** Summary ***");
            console.log(`*** Mode: ${summaryLengths[0]}\n\n ***`);
            console.log(`*** Length: ${summaryLengths[0]}\n\n ***`);
            console.log(`*** Mode: ${summaryTypes[0]}\n\n ***`);
            console.log(
                `*** Total Characters ${summarizedContent.length}\n\n***`,
            );
            textToSpeech(summarizedContent);
            summarizedContent = "";
            screenReaderEnd(() => {
                screenReaderActive = false;
            });
        }
    });
}

/* ========> End of Summary functions <======== */

/* 
Sets the value of local variables to session data
associated with it
*/
function asyncVarValues() {
    getSessionData("extensionActive").then((result) => {
        extensionActive = result;
    });

    getSessionData("agentActive").then((result) => {
        agentOn = result;
    });
}

/*
This function checks the value of the local variable
'language' to ensure it has a value and isn't just 'undefined'
*/
function checkLocalData() {
    getLocalData("language").then((r) => {
        if (r === undefined) {
            setLocalData("language", "english");
        }
    });
}

/* ========> Functions <======== */
/* ========================= End of Functions ================================== */

asyncVarValues();
checkLocalData();

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

        if (navigator.userActivation.isActive || panelOpen) {
            if (!extensionActive) {
                setActive(true, "Activated");
                sendMessage("service-worker", { purpose: "openSidePanel" });
            } else if (extensionActive) {
                setActive(false, "Deactivated");
            }
        } else {
            // This code will run if the sidePanel isn't open
            let activation = extensionActive ? "deactivate" : "activate";
            textToSpeech(
                `We are terribly sorry, you need to interact with the page with your mouse or keyboard once in order for Briefly to ${activation}`,
            );
            console.log(`***** Not activated *****`);
            console.log("Panel open", panelOpen);
        }
        console.log("*** Pressed Shift + Ctrl ***");
    }

    // Debugging
    console.log(`Extension Active: ${extensionActive}`);
    console.log(`Agent active: ${agentOn}`);

    /* Extension Keyboard Commands */
    if (extensionActive) {
        /* F2 */
        // Checks if user held F2 for at least 1 second to trigger Agent
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

        /* Shift */
        if (event.key === "Shift" && allowShift) {
            // Shifts the summaryLengths array
            shiftArr(summaryLengths, "selected length:");
            timesShiftPressed.add();
            if (timesShiftPressed.conditionMet()) {
                textToSpeech("Opening Tutorial Tab");
                sendMessage("service-worker", {
                    purpose: "createNewTab",
                    url: "pages/instructions.html",
                });
            }
        }

        allowShift = true;

        /* Control */
        // Play Summarizer if Control is pressed 3 times
        if (event.key === "Control") {
            if (screenReaderActive) {
                stopScreenreader();
            } else {
                timesControlPressed.add();
            }

            if (timesControlPressed.conditionMet()) {
                if (!screenReaderActive) {
                    screenReaderActive = true;

                    /* Create summary is called early to have it be ready sooner */

                    loadContent = createSummary();

                    playSummary();
                }
            }

            /* Interrupt AI Agent */
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

        /* 't' */
        /*
        this is a special key for developers to observe
        the value of variables and data
         */
        if (event.key === "t") {
            getLocalData("language").then((r) => console.log("Data: ", r));
        }

        /* Back tick (`) */
        // Toggles language between English and Spanish
        if (event.key === "`") {
            if (!screenReaderActive && !agentOn) {
                toggleLanguage();
            }
        }
    }
    // Debugging
    console.log(timesControlPressed.toString(), screenReaderActive, event.key);
});

/* ========> End of Key Down <======== */

/* ========================= Event Listeners ================================== */

/* This code checks if the session data is updated to immediately update
the value of local variables */
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

        if (key === "panelOpen") {
            panelOpen = newValue;
            console.log("Panel open set to ", panelOpen);
            screenReaderEnd(() => {
                textToSpeech("Press Shift 3 times to access our tutorial");
            });
        }

        if (key === "language") {
            language = newValue;
            console.log("Language set to ", language);
        }
    }
});

/* ========================= End of Event Listeners ================================== */
