/* Variables */
let microphoneAccess;

// Used to store synthesized speech and formatted sentences
let speechToTextResult;
let sentences;
// The state of the AI Agent
let agentOn = false;
let requestSent = false;
// The response from the AI Agent given back from the server
let agentResponse = "";

// Handles timers with the AI Agent and Audio Input system
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

// Handles messages from content scripts and service-worker
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

        // Interrupts the AI Agent's response but doesn't terminate conversation
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

/* If starting the recognition results in an error,
 the agent forcefully closes */
function startRecognition() {
    try {
        if (agentOn) {
            recognition.start();
        }
    } catch {
        stopAIAgent("An error occurred, AI Agent had to cancel");
    }
}

// Sets the local variable and session data to 'state'
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
function stopAIAgent(msg = "Exiting AI Agent") {
    if (agentOn) {
        setAgentActive(false);
        timeHandler.clearAllTime();
        playStopEffect();
        textToSpeech(msg);
        recognition.stop();
    }
}

// Sets 'agentresponse' to a variable once the server returns a response
async function getAgentResponse() {
    requestSent = true;

    let response = await callAgent(sentences).catch((error) => {
        console.log(
            "********\n\nError when fetching from server:\n${error}\n\n********",
        );
        return error;
    });

    agentResponse = response;
}

// Called once user has given input
async function afterSpeech() {
    if (agentOn && !requestSent) {
        getAgentResponse();
        timeHandler.clearAllTime();
        recognition.stop();

        textToSpeech("Thank you, please wait");

        // While an async function is pending, play this loop
        // When finished, break
        let timesWaited = 0;
        while (agentResponse === "" && agentOn) {
            await Sleep(3000);
            if (agentResponse != "") {
                break;
            } else if (timesWaited > 3) {
                stopAIAgent(
                    "The server didn't respond in time. Please try again.",
                );

                break;
            } else {
                playAlertEffect();
            }
            timesWaited++;
            await Sleep(3000);
        }
        if (agentResponse != "no response needed" && agentOn) {
            textToSpeech(agentResponse);
            agentResponse = "";
        }
        screenReaderEnd(() => {
            requestSent = false;
            startRecognition();
            timeHandler.setTime("noResponse", stopAIAgent, 10);
        });
    }
}

/* Returns a formatted string of the sentences array to be sent to be
processed by the AI Agent */
function toSpeechArray(list) {
    let sentences = [];
    for (let i = 0; i < list.length; i++) {
        sentences.push(
            Array.from(list[i]).map((result) => result.transcript)[0],
        );
    }
    return sentences.join(".") + ".";
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
    sentences = toSpeechArray(event.results);
    console.log(`Just spoken: (${text})`);
    console.log("Sentences:", sentences);
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
