// Listents to keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    let summarizedContent = "Hello there!";

    // When user presses Ctrl+B
    if (command === "summarize-page") {
        // Summarized content created from AI

        // Fetches summarization from server
        async function summarizeContent() {
            const response = await fetch(
                "https://summary-chrome-extension-backend.onrender.com/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(document.body.innerText),
                }
            );

            const data = await response.json();

            summarizedContent = data.summary;
            console.log(data.summary);
            return data.summary;
        }

        let tab = await getCurrentTab();

        summarizeContent();

        // getCnt.then((result) => {
        //     chrome.scripting.executeScript({
        //     target: {tabId: tab.id},
        //     func: () => {console.log(result)}
        //     })
        // })

        // Prints message alerting that Ctrl+B has been pressed
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                console.log("Pressed Ctrl+B");
            },
        });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: summarizeContent,
        });

        // Executes text-to-speech function
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: textToSpeech,
            args: ["Hello World"],
        });
    }
});

function handleMessage(request, sender, sendResponse) {
    listTabs().then((tabs) => {
        let tabArray = []
        tabs = tabs.map((tab) => {
            tabArray.push(tab.title);
            return tab.title;
        })
        tabArray = tabArray.join("\n");
        sendResponse({ tabs: tabArray });
    })
    return true;
}
     

chrome.runtime.onMessage.addListener(handleMessage);

// Gets the current tab
async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs[0];
}

// Converts given text to speech
function textToSpeech(givenText) {
    const utterance = new SpeechSynthesisUtterance(givenText);
    window.speechSynthesis.speak(utterance);
}

// List Current Tabs
async function listTabs() {
    let tabs = await chrome.tabs.query({});
    return tabs;
}
