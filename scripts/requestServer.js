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

// Summarizes the content of a webpage
async function summarizeContent() {
    // Endpoint 1 - Weak extractive summarization to avoid rate limits
    const endpoint1 =
        "https://summary-chrome-extension-backend.onrender.com/simple-sum";

    // Endpoint 2 - Strong AI summarization with OpenAI
    const endpoint2 =
        "https://summary-chrome-extension-backend.onrender.com/ai-sum";

    // Fetch from server
    const response = await serverFetch(endpoint1, {
        input: document.body.innerText,
    });

    // Response

    // data.summary is the summary
    summarizedContent = response.summary;

    // Debugging
    console.log(summarizedContent);

    return response.summary;
}

async function callAgent(sentences) {
    const endpoint =
        "https://summary-chrome-extension-backend.onrender.com/agent-call";
    //const response = await serverFetch(endpoint, { input: sentences });

    // It returns an array so we must specify [0] to get the first object
    const json_response = JSON.parse(mine)[0];
}
