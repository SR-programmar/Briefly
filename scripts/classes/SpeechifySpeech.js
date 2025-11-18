/*

When using the summarizer, if strict is "false" meaning that it'll use
a powerful LLM and realistic AI voices, it works different. Instead of
sending a string, it will send a b64 encoded mp3 that must be decoded
and then turned into an Audio object to be played.

*/

// Creats an audio object with base64Text
class SpeechifySpeech {
    // The undefined audio object
    recording;

    // Constructor
    constructor(b64Text) {
        this.b64Text = b64Text;
        this.createRecording();
    }

    // Defines the recording as an audio object
    createRecording() {
        this.recording = this.createMp3(this.b64Text);
    }

    // Creates new audio object with b64 text
    createMp3(b64Text) {
        let audioType = "audio/mp3";

        let audioDataUri = `data:${audioType};base64,${b64Text}`;
        console.log("Playing mp3...");

        let audio = new Audio(audioDataUri);

        return audio;
    }

    // Plays the audio
    playAudio() {
        this.recording.play();
    }

    // Resets the audio
    resetAudio() {
        this.recording.pause();
        this.recording.currentTime = 0;
    }
}
