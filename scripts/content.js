/*

This script is where all of the app's main functionality is held
It listens for keyboard commands and clicks to determine what the user
wants to do.
It relies on several functions/classes from other files

*/

console.log("Content.js Script injected into tab");

const summaryModes = ["Medium", "Short", "Two-Sentence", "Long"];

// Summarized Content
let summarizedContent = "";

// Checks how many times user pressed Control
let timesControlPressed = 0;

// Boolean tells if screen reader is active or not
let screenReaderActive = false;

// To Handle AI Agent audio input functionality
let startTime;
let keyWasHeld = false;

/* Summarizes the webpage in the background so the user doesn't have to
wait too long for the summary */

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
    if (summarizedContent === "") {
        await createSummary();
    }
    playStartEffect();
    await Sleep(500);
    textToSpeech("Starting Summary");
    await Sleep(1500);
    if (screenReaderActive) {
        textToSpeech(summarizedContent);
    }
}

document.addEventListener("keyup", () => {
    let timeHeld = new Date().getSeconds() - startTime;
    keyWasHeld = false;
    startTime = undefined;

    if (timeHeld >= 1) {
        startAIAgent();
    }
});

document.addEventListener("keydown", (event) => {
    // Checks if user holds down F2 for atleast 1 second to trigger Agent
    if (event.key === "F2") {
        if (!keyWasHeld) {
            startTime = new Date().getSeconds();
            keyWasHeld = true;
        }
    }

    if (event.key === "Shift") {
        // Shifts the summaryModes array
        summaryModes.unshift(summaryModes[summaryModes.length - 1]);
        summaryModes.pop();

        textToSpeech(`Selected mode: ${summaryModes[0]}`);
    }

    // Stop conversation with agent
    if (event.key === "Escape") {
        stopAIAgent();
    }

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
    }

    if (timesControlPressed === 3) {
        if (!screenReaderActive) {
            screenReaderActive = true;
            playSummary();
        }
    }

    console.log(timesControlPressed, screenReaderActive, event.key); // Debugging
});

let gesture = false;

document.addEventListener("click", () => {
    if (!gesture) {
        textToSpeech("Thank you for using Blind Time!");
        gesture = true;
    }
});
