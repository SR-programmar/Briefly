/* 

Used to check whether or not a key was pressed 
a certain amount of times. 

*/

class TimesPressed {
    // Instance Variables
    value = 0;
    condition;

    // Constructor
    constructor(valueUpTo) {
        this.condition = valueUpTo;
    }

    // Adds 1 to value. Resets it after 1.5 seconds.
    add() {
        this.value++;
        setTimeout(() => {
            this.value = 0;
        }, 1500);
    }

    // Returns true if value is equal to condition
    conditionMet() {
        if (this.value === this.condition) {
            this.value = 0;
            return true;
        }
        return false;
    }

    // Used to print this.value for debugging
    toString() {
        return this.value;
    }
}
