/*

This javascript file is used to hold a default screenreader
to use for testing. Summarize.js can return much more human sounding voices,
but this is built in and won't get rate-limited.

*/

// Variables
const screenReader = new SpeechSynthesisUtterance();
const synth = window.speechSynthesis;
let screenReaderPaused = false;

// Converts given text to speech
function textToSpeech(givenText) {
    synth.cancel();
    setText(givenText);
    synth.speak(screenReader);
}

// Pauses or Unpauses the screen reader
function pauseScreenReader() {
    playPauseEffect();

    if (!screenReaderPaused) {
        synth.pause();
    } else {
        synth.resume();
    }

    screenReaderPaused = !screenReaderPaused;
}

// Stops screen reader
function stopScreenreader() {
    synth.cancel();
    playStopEffect();
    setText("Cancelling screen reader");
    synth.speak(screenReader);
    screenReaderActive = false;
    screenReaderPaused = false;
}

// Sets screenreader's text
function setText(text) {
    screenReader.text = text;
}

// Returns screenreader's text
function getText() {
    return screenReader.text;
}

// Calls 'callBack' after screenreader is done speaking
function screenReaderEnd(callBack) {
    screenReader.onend = () => {
        callBack();
        screenReader.onend = undefined;
    };
}
// Sets the built-in screenreader to the most human sounding voice
synth.addEventListener("voiceschanged", () => {
    screenReader.voice = synth.getVoices()[4];
});
