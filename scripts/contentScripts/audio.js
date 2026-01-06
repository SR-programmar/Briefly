// Sound effects
const startEffect = createAudio("audio/Start.mp3");
const stopEffect = createAudio("audio/Stop.mp3");
const alertEffect = createAudio("audio/alertEffect.mp3");
const pauseEffect = createAudio("audio/pauseSound.mp3");

// Creates a qualified URL for a .mp3 file
function createAudio(fileName) {
    return new Audio(chrome.runtime.getURL(fileName));
}

// Sound effect to indicate AI Agent has started listening
function playStartEffect() {
    startEffect.play();
}

// Plays the sound effect indicating the AI has stopped listening
function playStopEffect() {
    stopEffect.play();
}

// Plays sound whilst AI Agent and Summary are pending
function playAlertEffect() {
    alertEffect.play();
}

// plays the sound effect for pausing and unpausing
function playPauseEffect() {
    pauseEffect.play();
}
