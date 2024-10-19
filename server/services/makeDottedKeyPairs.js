import arrayEntriesOf from "../utils/arrayEntriesOf.js";
import breakdownDottedKeypairs from './breakdownDottedKeypairs.js';

// Setting the properties of the nested object with dot notation
export default (total, input, propName) => {
    if (propName === 'Hourly Breakdown') return breakdownDottedKeypairs(input[propName]);

    // convert the object key value pairs in an array
    const inputEntries = arrayEntriesOf(input, propName);

    // connect the nested object property to it's child properties with dot notation on a string
    const keyPairs = inputEntries.map(([keys, values]) => [`${propName}.${keys}`, values]);
    keyPairs.push([`${propName}.Total ${propName}`, total])
    
    const newValues = Object.fromEntries(keyPairs);
    return newValues;
};