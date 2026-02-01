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
        "Thank you, Briefly now has access to your microphone. I will return you to your original tab."
    );
    screenReaderEnd(() => {
        stopTrack(mic);
        exitOptions();
    });
}

// Played when user denies permission
function denied() {
    textToSpeech("You have denied Briefly access to your microphone");
    screenReaderEnd(() => {
        exitOptions();
    });
}

// Updates permission in sidePanel and closes the current tab
function exitOptions() {
    sendMessage("sidePanel", { purpose: "updateMicrophonePermission" });
    sendMessage("service-worker", { purpose: "closeCurrentTab" });
}

/*

 This stops the recording immediately after user grants permission
 because it isn't needed here
 
*/
function stopTrack(device) {
    console.log(device.getTracks()[0]);
    device.getTracks()[0].stop();
}
