/*

This javascript file is used to hold a async
function that summarizes the content of a webpage
by going to another server and getting the summarization

*/

// Provides a template to fetch data from the server
async function serverFetch(endpoint, json_obj) {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(json_obj),
    });

    const data = await response.json();
    return data;
}

/* Makes a call to the Python server which sends back a summary
of the webpage's content that a user is currently on.
*/
async function summarizeContent(summaryMode) {
    // Endpoint 1 - Weak extractive summarization to avoid rate limits
    const endpoint1 =
        "https://summary-chrome-extension-backend.onrender.com/simple-sum";

    // Endpoint 2 - Strong AI summarization with OpenAI
    const endpoint2 =
        "https://summary-chrome-extension-backend.onrender.com/ai-sum";

    // Fetch from server
    const response = await serverFetch(endpoint1, {
        input: document.body.innerText,
        mode: summaryMode,
    });

    // data.summary is the summary
    summarizedContent = response.summary;

    // Debugging
    console.log(summarizedContent);

    return response.summary;
}

/* Makes a call to the Python server which sends back a JSON formatted object
as a response to the user's wish
*/

async function callAgent(sentences) {
    // API Endpoint

    /// Endpoint - Used for testing
    const endpoint1 =
        "https://summary-chrome-extension-backend.onrender.com/simple-agent-call";

    // Endpoint - The actual AI Agent, used in production
    const endpoint2 =
        "https://summary-chrome-extension-backend.onrender.com/agent-call";

    const response = await serverFetch(endpoint2, { input: sentences });
    console.log(response);
    // It returns an array so we must specify [0] to get the first object
    const json_response = JSON.parse(response.response)[0];

    const idx = json_response.index; // Function index
    const args = json_response.arguments; // Arguments if function needs it

    if (idx > -1) {
        const functions = [navigateTo, openUrl, listTabs];

        if (idx === 0 || idx === 1) {
            functions[idx](args.arg1);
        } else {
            functions[idx]();
        }
    } else {
        console.log("\n*** Function not needed ***\n");
    }
    // Return response from agent
    return json_response.agentResponse;
}
