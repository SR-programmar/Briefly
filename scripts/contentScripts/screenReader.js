/*

This javascript file is used to hold a default screenreader
to use for testing. Summarize.js can return much more human sounding voices,
but this is built in and won't get rate-limited.

*/

// Variables
const screenReader = new SpeechSynthesisUtterance();
const synth = window.speechSynthesis;
let voices;
let language;
let screenReaderPaused = false;

// Sets language to stored value in local storage
getLocalData("language").then((result) => {
    language = result;
});

// Converts given text to speech
async function textToSpeech(givenText) {
    synth.cancel();
    if (language === "english") {
        setText(givenText);
    } else if (language === "spanish") {
        screenReader.voice = voices[7];
        let translatedText = await translateToSpanish(givenText);
        setText(translatedText);
    }
    console.log(getText());
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
function stopScreenreader(msg = "Cancelling screen reader") {
    synth.cancel();
    playStopEffect();
    setText(msg);
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

// Switches the language to Spanish or English
async function toggleLanguage() {
    let lang = await getLocalData("language");
    if (lang === "english") {
        screenReader.voice = voices[7];
        language = "spanish";
        textToSpeech("cambiado a español");
        setLocalData("language", "spanish");
    } else if (lang === "spanish") {
        screenReader.voice = voices[4];
        language = "english";
        textToSpeech("Switched to English");
        setLocalData("language", "english");
    }
}

// Translates English into Spanish
async function translateToSpanish(text) {
    common_phrases = { Activated: "activado", Deactivated: "desactivado" };
    if (Object.hasOwn(common_phrases, text)) {
        return common_phrases[text];
    }

    return text;
}

// Sets the built-in screenreader to the most human sounding voice
synth.addEventListener("voiceschanged", () => {
    voices = synth.getVoices();
    screenReader.voice = voices[4];
});
