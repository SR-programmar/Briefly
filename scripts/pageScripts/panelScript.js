// Variables
let microphoneAccess;

let speechToTextResult;
let sentences;
let agentOn = false;
let agentResponse = "";

let timeHandler = new TimeOutHandler("noResponse, finalResult, fallBack");

const recognition = createRecognition();
let agentStartMessage = `Hello, I'm Rosie, your AI Agent. I will answer
your questions and requests! press escape to stop talking`;

// Returns the status of microphone access
// Prompt, Granted, or denied
function setMicrophoneAccess() {
    getMicrophoneAccess().then((result) => {
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
            if (!agentOn) {
                console.log("Starting...");
                setUpAgent();
            }
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

        if (data.purpose === "interruptAgent") {
            recognition.stop();
            textToSpeech("Interrupted, now listening");
            screenReaderEnd(() => {
                startRecognition();
            });
        }
    }
}
/* ========================= Main Functions ================================== */

// If starting the recognition results in an error, exit agent
function startRecognition() {
    try {
        if (agentOn) {
            recognition.start();
        }
    } catch {
        stopAIAgent();
        textToSpeech("An error occurred, AI Agent had to cancel");
    }
}

function setAgentActive(state) {
    setAgentOn(state);
    agentOn = state;
}

/* This is used to make sure the agent works properly before talking to the
user. If the microphone is not accessible, a message will be played */
function setUpAgent() {
    if (!microphoneAccess) {
        textToSpeech(
            `You need to give Briefly access to use your microphone,
                I will open a new tab for you with a button that you can click to give permission. Press your tab key once to get to the button. Once you press it, a prompt will ask you for permission. Use your down arrow key to navigate. Choose 'Allow when using site'`,
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
            "Uh oh! You've denied Briefly permission, was this a mistake?",
        );
    }
}

// Creates a Speechrecognition Object
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
            startRecognition();

            // If the user says nothing, it will stop the listening
            timeHandler.setTime("noResponse", stopAIAgent, 10);
        }
    });
}

// Played when AI Agent is cancelled and the user doesn't produce any noise
function stopAIAgent() {
    if (agentOn) {
        setAgentActive(false);
        timeHandler.clearAllTime();
        playStopEffect();
        textToSpeech("Exiting AI Agent");
        recognition.stop();
    }
}

// Sets 'agentresponse' to a variable once the server returns a response
async function getAgentResponse() {
    let response = await callAgent(formattedSentences()).catch((error) => {
        console.log(
            "********\n\nError when fetching from server:\n${error}\n\n********",
        );
        return error;
    });
    agentResponse = response;
}

// Called once user has given input
async function afterSpeech() {
    if (agentOn) {
        getAgentResponse();
        timeHandler.clearAllTime();
        recognition.stop();

        textToSpeech("Thank you, please wait");

        // While an async function is pending, play this loop
        // When finished, break

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
        agentResponse = "";
        screenReaderEnd(() => {
            startRecognition();
            timeHandler.setTime("noResponse", stopAIAgent, 10);
        });
    }
}

/* Returns a formatted string of the sentences array to be sent to be
processed by the AI Agent */
function formattedSentences() {
    if (sentences === undefined) {
        stopAIAgent();
    } else {
        let formattedSentences = `${sentences.join(".")}.`;
        return formattedSentences;
    }
}

/* ========================= End of Main Functions ================================== */

/**
 * These are the event listeners that listen for
 * events from the user: when the user starts speaking,
 * when the user speaks a single sentence, and when the user is
 * done speaking
 */

/* ========================= Event Listeners ================================== */

recognition.addEventListener("result", (event) => {
    speechToTextResult = event.results[event.results.length - 1];

    timeHandler.clearTime("noResponse");
    timeHandler.clearTime("finalResult");

    const text = Array.from(speechToTextResult)
        .map((result) => result.transcript)
        .join("\n");

    timeHandler.setTime("finalResult", afterSpeech, 3);
    sentences = text.split("\n");
    console.log(`(${text})`);
    console.log("Sentences", formattedSentences(sentences));
});

// This listener is qued when audio is heard
recognition.addEventListener("speechstart", () => {
    console.log("Started speaking :)");
    timeHandler.setTime("fallback", afterSpeech, 10);
});

// This is played when the url stops the microphone
recognition.addEventListener("speechend", () => {
    console.log("Finished speaking :)");
});

// Adds event listener
chrome.runtime.onMessage.addListener(handleMessage);

/* ========================= End of Event Listeners ================================== */
