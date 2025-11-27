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
    setTime(name, callback, seconds = 2) {
        this.timeOuts[name] = setTimeout(callback, seconds * 1000);
    }

    // Clears a specified timeout
    clearTime(name) {
        this.clearTimeOut(this.timeOuts[name]);
    }

    // Clears all the timeouts
    clearAllTime() {
        for (let key in this.timeOuts) {
            clearTimeout(this.timeOuts[key]);
        }
    }
}
