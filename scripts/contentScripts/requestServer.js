/*

This javascript file is used to make calls to Briefly's backend server
to summarize webpages, and process user requests for the AI Agent.

*/

// Provides a template to fetch data from the server
async function serverFetch(endpoint, json_obj) {
    return new Promise((resolve, reject) => {
        const response = fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(json_obj),
        })
            .then(async (response) => {
                const data = await response.json();
                resolve(data);
            })
            .catch((error) => {
                reject({
                    error: error,
                    summary: "An error occurred, please try again",
                    agentResponse:
                        "An error occurred, please try talking again or press Escape to cancel",
                    index: -1,
                });
            });
    });
}

/* Makes a call to the Python server which sends back a summary
of the webpage's content that a user is currently on.
*/
async function summarizeContent(summaryLength, summaryType) {
    // Endpoint 1 - Weak extractive summarization to avoid rate limits
    const endpoint1 =
        "https://summary-chrome-extension-backend.vercel.app/simple-sum";

    // Endpoint 2 - Strong AI summarization with OpenAI
    const endpoint2 =
        "https://summary-chrome-extension-backend.vercel.app/ai-sum";

    // Fetch from server
    const response = await serverFetch(endpoint2, {
        input: document.body.innerText,
        length: summaryLength,
        sum_type: summaryType,
    }).catch((error) => {
        console.log(
            `********\n\nError when fetching from server:\n${error.error}\n\n********`,
        );
        return error;
    });

    // data.summary is the summary
    summarizedContent = response.summary;

    // Debugging
    console.log(summarizedContent);

    return response.summary;
}

/* Calls a function based on AI Agent's JSON object */
function callAgentFunction(idx, args) {
    if (idx > -1) {
        const functions = [navigateTo, openUrl, listTabs, clickInteractive];
        const indicesURL = [0, 1];
        console.log(args.clickElementText, idx);
        if (idx === 3) {
            functions[idx](args.clickElementText, args);
        } else if (indicesURL.includes(idx)) {
            functions[idx](args.url);
        } else {
            functions[idx]();
        }
    } else {
        console.log("\n*** Function not needed ***\n");
    }
}

/* Makes a call to the Python server which sends back a JSON formatted object
as a response to the user's wish
*/

async function callAgent(sentences) {
    // API Endpoint

    /// Endpoint 1 - Used for testing
    const endpoint1 =
        "https://summary-chrome-extension-backend.vercel.app/simple-agent-call";

    // Endpoint 2 - The actual AI Agent, used in production
    const endpoint2 =
        "https://summary-chrome-extension-backend.vercel.app/agent-call";

    // Fetch from server
    const response = await serverFetch(endpoint2, { input: sentences }).catch(
        (error) => {
            console.log(
                `********\n\nError when fetching from server:\n${error.error}\n\n********`,
            );
            return error;
        },
    );
    console.log(response);
    if ("error" in response) {
        return response.agentResponse;
    }
    // It returns an array so we must specify [0] to get the first object
    const json_response = JSON.parse(response.response)[0];

    const idx = json_response.index; // Function index
    const args = json_response.arguments; // Arguments if function needs it

    if (Array.isArray(idx)) {
        for (let i = 0; i < idx.length; i++) {
            callAgentFunction(idx[i], args);
        }
    } else {
        callAgentFunction(idx, args);
    }
    // Return response from agent
    return json_response.agentResponse;
}
