/*

This javascript file is used to hold our screen reader,
a software that can read text aloud to the visually impaired
user.

*/

// Variables
const screenReader = new SpeechSynthesisUtterance();
const synth = window.speechSynthesis;
let voices;
let language;
let screenReaderPaused = false;

/* Sets local variable 'language' 
to value associated with language in local storage */
getLocalData("language").then((result) => {
    language = result;
});

// Converts given text to speech
async function textToSpeech(givenText) {
    synth.cancel();
    if (language === "english") {
        screenReader.voice = voices[4];
        setText(givenText);
    } else if (language === "spanish") {
        screenReader.voice = voices[7];
        let translatedText = await translateToSpanish(givenText);
        setText(translatedText);
    }
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
    playStopEffect();
    textToSpeech(msg);
    screenReaderActive = false;
    screenReaderPaused = false;
}

// Sets the text the screen reader needs to translate
function setText(text) {
    screenReader.text = text;
}

// Returns screen reader's text
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

// Switches the language to Spanish or English and updates local storage
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
    } else {
        let translation = await translateToSpanishRequest(text);
        return translation;
    }
}

// Sets the built-in screen reader to the most human sounding voice
synth.addEventListener("voiceschanged", () => {
    voices = synth.getVoices();
    screenReader.voice = voices[4];
});
