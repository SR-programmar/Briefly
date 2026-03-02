/*

This file includes extra functions that panel script needs.
The purpose of this file is to keep panelScript clean.

*/

// Returns true if permission is granted and false otherwise
async function getMicrophoneAccess() {
    let permissionStatus = await navigator.permissions.query({
        name: "microphone",
    });
    permissionStatus = permissionStatus.state;
    console.log(`This is the permission Status`, permissionStatus);

    if (permissionStatus === "prompt") {
        return false;
    } else if (permissionStatus === "granted") {
        return true;
    } else if (permissionStatus === "denied") {
        return "denied";
    }
}
