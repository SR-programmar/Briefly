/*

This javascript file is used to hold a default screenreader
to use for testing. Summarize.js can return much more human sounding voices,
but this is built in and won't get rate-limited.

*/

// The speechsynthesis utterance
const screenReader = new SpeechSynthesisUtterance();
const synth = window.speechSynthesis;

// Converts given text to speech
function textToSpeech(givenText) {
    synth.cancel();
    screenReader.text = givenText;
    synth.speak(screenReader);
}

// Stops screen reader
function stopScreenreader() {
    synth.cancel();
    screenReader.text = "Cancelling screen reader";
    synth.speak(screenReader);
    screenReaderActive = false;
}

// Sets the built-in screenreader to the most human sounding voice
synth.addEventListener("voiceschanged", () => {
    screenReader.voice = synth.getVoices()[4];
});
