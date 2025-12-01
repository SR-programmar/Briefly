// Variables
let speechToTextResult;
let sentences;

let timeHandler = new TimeOutHandler("noResponse, finalResult, fallBack");

const recogniton = createRecognition();
let agentStartMessage = `Hello, I'm Rosie, your AI Agent. I will answer
your questions and requests! press escape to stop talking`;

// Creates a SpeechRecogniton Object
function createRecognition() {
    const rec = new window.SpeechRecognition();
    rec.language = "en-US";
    rec.continuous = true;
    rec.interimResults = false;

    return rec;
}
// Played after user holds f2 for 1 second
async function startAIAgent() {
    playStartEffect();
    await Sleep(500);
    let intro = textToSpeech(agentStartMessage);

    // Waits for screenreader to finish before taking in input
    intro.onend = () => {
        agentStartMessage = "Listening";
        recogniton.start();

        intro.onend = undefined;

        // If the user says nothing, it will stop the listening
        timeHandler.setTime("noResponse", stopAIAgent, 10);
    };
}

// Played when AI Agent is cancelled and the user doesn't produce any noise
function stopAIAgent() {
    timeHandler.clearAllTime();
    playStopEffect();
    textToSpeech("Exiting AI Agent");
    recogniton.stop();
}

// Called once user has given input
function afterSpeech() {
    callAgent(formattedSentences());
    timeHandler.clearAllTime();
    textToSpeech("Thank you, please wait");
}

/* Returns a formatted string of the sentences array to be sent to be
processed by the AI Agent */
function formattedSentences() {
    let formattedSentences = `${sentences.join(".")}.`;
    return formattedSentences;
}
/**
 * These are the event listeners that listen for
 * events from the user: when the user starts speaking,
 * when the user speaks a single sentence, and when the user is
 * done speaking
 */
recogniton.addEventListener("result", (event) => {
    speechToTextResult = event.results;

    timeHandler.clearTime("noResponse");
    timeHandler.clearTime("finalResult");

    const text = Array.from(speechToTextResult)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("\n");

    timeHandler.setTime("finalResult", afterSpeech, 3);
    sentences = text.split("\n");
    console.log(`(${text})`);
});

// This listener is qued when audio is heard
recogniton.addEventListener("speechstart", () => {
    console.log("Started speaking :)");
    timeHandler.setTime("fallback", afterSpeech, 10);
});

// This is played when the url stops the microphone
recogniton.addEventListener("speechend", () => {
    console.log("Finished speaking :)");
});
