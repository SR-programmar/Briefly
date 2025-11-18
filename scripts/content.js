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

summarizeContent().then((result) => {
    summarizedContent = result;
});

document.addEventListener("keydown", (event) => {
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
