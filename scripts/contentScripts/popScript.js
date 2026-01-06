const button = document.getElementById("options-button");

// Opens up options page when button is clicked
button.addEventListener("click", () => {
    chrome.tabs.create({ url: "pages/options.html" });
});
