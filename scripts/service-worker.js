
// Listents to keyboard commands
chrome.commands.onCommand.addListener(async (command) => {

    // When user presses Ctrl+B
    if (command === 'summarize-page') {

        // Summarized content created from AI
        let summarizedContent = "Hello there!";

        // Fetches summarization from server
        async function summarizeContent() {
            const response = await fetch('https://summarizer-api-seven.vercel.app/', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({ input: document.body.innerText })
            })

            const data = await response.json();
            
            summarizedContent = data.summary;
        }

       
        let tab = await getCurrentTab();
        
        // Executes text-to-speech function
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: textToSpeech,
            args: [summarizedContent]
        })
     
    }
})


// Gets the current tab
async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true};
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs[0];
}

// Converts given text to speech
function textToSpeech(givenText) {
    const utterance = new SpeechSynthesisUtterance(givenText);
    window.speechSynthesis.speak(utterance);
}
