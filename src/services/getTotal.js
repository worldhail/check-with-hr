import arrayEntriesOf from "../utils/arrayEntriesOf.js";
import sumInPreciseDecimal from '../utils/sumInPreciseDecimal.js';
import getBreakdownTotal from './getBreakdownTotal.js';

// sum of the nested objects from the saved values and new input values
export default (payslipDoc, propName, input) => {
    if (propName === 'Hourly Breakdown') return getBreakdownTotal(payslipDoc, input[propName]);
    
    const payslip = {...payslipDoc.toObject()};

    const inputKeyPairs = arrayEntriesOf(input, propName);
    const payslipKeyPairs = arrayEntriesOf(payslip, propName);

    // exclude Total and _id property from payslip
    const filteredPayslipKeyPairs = payslipKeyPairs
        .filter(([keys]) => keys !== `Total ${propName}` && keys !== '_id');

    // look for missing properties of input from filtered payslip
    const missingPropertiesFromInput = filteredPayslipKeyPairs
        .filter(([keys]) => !input[propName].hasOwnProperty(keys));

    // push the missing properties to input for calculation
    missingPropertiesFromInput.forEach(items => inputKeyPairs.push(items));
    
    // get the sum of the properties
    const propertyValues = inputKeyPairs.map(([_, values]) => values);
    const sum = sumInPreciseDecimal(propertyValues);
 
    return sum;
};