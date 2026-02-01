/**
 * This class is used to handle several timeOut objects
 *
 */

class TimeOutHandler {
    // Holds all timeout functions
    timeOuts = {};

    // Creates a dictionary with key-value pairs of undefined values
    constructor(timeOuts) {
        const splitArr = timeOuts.split(", ");
        for (let i = 0; i < splitArr.length; i++) {
            this.timeOuts[splitArr[i]] = undefined;
        }
    }

    // Sets a specified timeout
    setTime(name, callback, seconds) {
        this.timeOuts[name] = setTimeout(callback, seconds * 1000);
    }

    // Clears a specified timeout
    clearTime(name) {
        if (this.checkName(name)) {
            clearTimeout(this.timeOuts[name]);
        } else {
            return "Name doesn't exist";
        }
    }

    // Clears all the timeouts
    clearAllTime() {
        for (let key in this.timeOuts) {
            clearTimeout(this.timeOuts[key]);
        }
    }

    // Checks if the name actually exists in timeOuts
    checkName(name) {
        return name in this.timeOuts;
    }
}
