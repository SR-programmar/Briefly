// Variables
let microphoneAccess;

// Variables
let speechToTextResult;
let sentences;
let agentOn = false;
let agentResponse = "";

let timeHandler = new TimeOutHandler("noResponse, finalResult, fallBack");

const recogniton = createRecognition();
let agentStartMessage = `Hello, I'm Rosie, your AI Agent. I will answer
your questions and requests! press escape to stop talking`;

// Returns the status of microphone access
// Prompt, Granted, or denied
function setMicrophoneAccess() {
    getMicrophoneAcess().then((result) => {
        microphoneAccess = result;
        console.log(`Microphone Access is: ${microphoneAccess}`);
    });
}

setMicrophoneAccess();

// Handles messages from content scripts
function handleMessage(message, sender, sendResponse) {
    const data = message.data;
    if (message.target === "sidePanel") {
        // Closes side panel
        if (data.purpose === "closeSidePanel") {
            window.close();
        }

        // Starts AI Agent conversation
        if (data.purpose === "startAgent") {
            console.log("Starting...");
            setUpAgent();
        }

        // Stops AI Agent conversation
        if (data.purpose === "stopAgent") {
            console.log("Stopping...");
            stopAIAgent();
        }

        // Pauses AI Agent
        if (data.purpose === "pauseAgent") {
            pauseScreenReader();
        }

        // Updates microphone permission
        if (data.purpose === "updateMicrophonePermission") {
            setMicrophoneAccess();
        }
    }
}
/* ========================= Main Functions ================================== */

function setAgentActive(state) {
    setAgentOn(state);
    agentOn = state;
}

/* This is used to make sure the agent works properly before talking to the
user. If the microphone is not accessible, a message will be played */
function setUpAgent() {
    if (!microphoneAccess) {
        textToSpeech(
            `You need to give blind time access to use your microphone,
                I will open a new tab for you with a button that you can click to give permission. Press your tab key once to get to the button. Once you press it, a prompt will ask you for permission. Use your down arrow key to navigate. Choose 'Allow when using site'`
        );

        screenReaderEnd(() => {
            sendMessage("service-worker", {
                purpose: "createNewTab",
                url: "pages/options.html",
            });
        });
    } else if (microphoneAccess === true) {
        startAIAgent();
    } else if (microphoneAccess === "denied") {
        textToSpeech(
            "Uh oh! You've denied Blind Time permission, was this a mistake?"
        );
    }
}

// Creates a SpeechRecogniton Object
function createRecognition() {
    const rec = new window.SpeechRecognition();
    rec.language = "en-US";
    rec.continuous = true;
    rec.interimResults = false;

    return rec;
}
// Played after user holds F2 for 1 second
async function startAIAgent() {
    setAgentActive(true);
    playStartEffect();
    await Sleep(500);
    textToSpeech(agentStartMessage);

    // Waits for screenreader to finish before taking in input
    screenReaderEnd(() => {
        if (agentOn) {
            agentStartMessage = "Listening";
            recogniton.start();

            // If the user says nothing, it will stop the listening
            timeHandler.setTime("noResponse", stopAIAgent, 10);
        }
    });
}

// Played when AI Agent is cancelled and the user doesn't produce any noise
function stopAIAgent() {
    setAgentActive(false);
    timeHandler.clearAllTime();
    playStopEffect();
    textToSpeech("Exiting AI Agent");
    recogniton.stop();
}

async function getAgentResponse() {
    let response = await callAgent(formattedSentences());
    agentResponse = response;
}

// Called once user has given input
async function afterSpeech() {
    getAgentResponse();
    timeHandler.clearAllTime();
    recogniton.stop();

    textToSpeech("Thank you, please wait");

    // While an async function is pending, play this loop
    // When finishsed, break

    while (agentResponse === "" && agentOn) {
        await Sleep(3000);
        if (agentResponse != "") {
            break;
        } else {
            playAlertEffect();
        }

        await Sleep(3000);
    }
    textToSpeech(agentResponse);

    screenReaderEnd(() => {
        recogniton.start();
        timeHandler.setTime("noResponse", stopAIAgent, 10);
    });
}

/* Returns a formatted string of the sentences array to be sent to be
processed by the AI Agent */
function formattedSentences() {
    let formattedSentences = `${sentences.join(".")}.`;
    return formattedSentences;
}

/* ========================= End of Main Functions ================================== */

/**
 * These are the event listeners that listen for
 * events from the user: when the user starts speaking,
 * when the user speaks a single sentence, and when the user is
 * done speaking
 */

/* ========================= Event Listeners ================================== */

recogniton.addEventListener("result", (event) => {
    speechToTextResult = event.results[event.results.length - 1];

    timeHandler.clearTime("noResponse");
    timeHandler.clearTime("finalResult");

    const text = Array.from(speechToTextResult)
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

// Adds event listener
chrome.runtime.onMessage.addListener(handleMessage);

/* ========================= End of Event Listeners ================================== */
