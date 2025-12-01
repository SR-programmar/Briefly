/*

This script is where all of the app's main functionality is held
It listens for keyboard commands and clicks to determine what the user
wants to do.
It relies on several functions/classes from other files

*/

console.log("Content.js Script injected into tab");
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

summarizeContent().then((result) => {
    summarizedContent = result;
});

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

    // Stop conversation with agent
    if (event.key === "Escape") {
        stopAIAgent();
    }

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
    }

    if (timesControlPressed === 3) {
        if (!screenReaderActive) {
            textToSpeech(summarizedContent);
            screenReaderActive = true;
        }
    }

    console.log(timesControlPressed, screenReaderActive, event.key); // Debugging
});
