![Alt text](resources/logos/Briefly%20Logo.png)

Logo created in [Canva]("https://www.canva.com/")

An app designed to assist the visually impaired in using the internet

## Note for judges

Briefly has a [back-end server](https://github.com/SR-programmar/Briefly-back-end) written in Python. Briefly makes calls to this server in requestServer.js

## What is Briefly?

- Briefly is Chrome Extension designed for the visually impaired to help save them time.
- It saves them time by **summarizing webpages with Artificial intelligence** and then reading it aloud with a screen reader
- Briefly has an **AI Agent web assistant named Rosie**. She acts like "Siri" but for the web. You ask her questions or give her instructions, and she will execute them.

## Important Notes

- Briefly only works on webpages. Attempting to use its commands on a "New tab" window or any other [**Chrome internal page**](https://winaero.com/the-list-of-chrome-urls-for-internal-built-in-pages/) wont work
- To activate Briefly, you must interact with the webpage by pressing a key on your keyboard or clicking on the screen with your mouse. Pressing Shift + Ctrl will give you a notify if you haven't interacted with the page.

## Installation

If you'd like to set up Briefly, here is the tutorial

### Written Tutorial

1. Download the extension as a **.zip** file at [Github](https://github.com/surya-rajendran065/Briefly)

2. Find the location of the .zip file, right click on it and select **Extract all**
3. In the locatin bar, remove the part that says "Briefly-main"

**C:/Users/your_username/Downloads/Briefly-main** &rarr; **C:/Users/your_username/Downloads/**

4. There should be a new folder created called **Briefly** in the same location you unzipped the .zip file.
5. Open the Chrome Browser and in the search bar, type **chrome://extensions/** and hit enter.
6. On the top right hand corner, click the **"Developer Mode"** slider
7. On the top left corner, click **"Load unpacked"**, then search for the **Briefly** folder you unzipped earlier.
8. Now, you should see something like this appear in the extensions manager tab.
9. Click on details, scroll down and enable "pin to toolbar"
10. You should see a Square "B" icon appear next to the "Extensions icon"
11. Click on it and it will give you instructions for how to use the Briefly Chrome Extension
12. Navigate to a webpage, press Shift + Ctrl, Briefly should now be activated.

## Briefly Commands

This part of the README.md teaches you how to use the extension itself

### Activation

- Interact with the webpage by pressing a key on your keyboard on clicking somewhere. e.g press Space
- Press Shift + Ctrl to activate the extension
- Pressing Shift + Ctrl while the extension is active will deactivate it

### Summarization Commands

- Ctrl x3 - Summarizes a webpage
- Ctrl (While summary is being read) - Cancels Summary
- Capslock - Pauses Screen reader

### Summarization customization Commands

**Will only work if screen reader is inactive**

- Shift - Changes the length of the summary
- Capslock - Changes the type of summary
- Shift x3 - Opens up instructions page with a braille downloadable file
- Back Tick (`) - Toggles language between English or Spanish

### AI Agent commands

- Hold down F2 for 1 - Initiates conversation with Rosie
- Ctrl (while Rosie is active) - Interrupts her
- Escape - Terminates conversation
- Capslock - Pauses screen reader
