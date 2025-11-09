chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'summarize-page') {
        async function summarizeContent() {
            const response = await fetch('https://summarizer-api-seven.vercel.app/', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({ input: document.body.innerText })
            })

            const data = await response.json()
            console.log(data.summary)
}

        let tab = await getCurrentTab();
        console.log(tab.id);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: summarizeContent
        })
    }
})

async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true};
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs[0];
}

