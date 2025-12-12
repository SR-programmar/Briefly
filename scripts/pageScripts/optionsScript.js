// Button they press to allow permission
const button = document.getElementById("permission-button");

// Allows the extension access to user's microphone
button.addEventListener("click", () => {
    let microphone = navigator.mediaDevices.getUserMedia({ audio: true });
    microphone
        .then((microphone) => granted(microphone))
        .catch((err) => denied());
});

// Played when user grants permission
function granted(mic) {
    textToSpeech(
        "Thank you, blind time now has access to your microphone, return to your original tab using control + tab"
    );
    stopTrack(mic);
}

// Played when user denies permission
function denied() {
    textToSpeech(
        "You have denied blind time access to your microphone, return to your original tab using control + tab"
    );
}

// This stops the recording immediately after user grants permission
// because it isn't needed here
function stopTrack(device) {
    console.log(device.getTracks()[0]);
    device.getTracks()[0].stop();
}
