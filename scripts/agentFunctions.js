
console.log("Agent Functions script loaded");

function openUrl(url) {
    window.open(url,"_self")
}

function navigateTo(url) {
    window.open(url);
}

async function listTabs() {
    const tabs = await chrome.runtime.sendMessage({ message: "listTabs" });
    console.log(tabs.tabs);

}


document.addEventListener("keydown", async (event) => {
    if (event.ctrlKey && event.shiftKey &&  event.key.toLowerCase() === "k") {
        openUrl("https://www.example.com");
    }

    if (event.ctrlKey && event.shiftKey &&  event.key.toLowerCase() === "h") {
        navigateTo("https://www.example.com");
    }
    
    if (event.ctrlKey && event.shiftKey &&  event.key.toLowerCase() === "e") {
        await listTabs();
    }
})