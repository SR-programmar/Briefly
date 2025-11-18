/*

This javascript file is used to hold a async
function that summarizes the content of a webpage
by going to another server and getting the summarization

*/

console.log("Summarize.js Script injected into tab");

// Summarizes the content of a webpage
async function summarizeContent() {
    // Fetch from server
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

    // Response
    const data = await response.json();

    // data.summary is the summary
    summarizedContent = data.summary;

    // Debugging
    console.log(summarizedContent);

    return data.summary;
}
