import sumOfBreakdownValues from './sumOfBreakdownValues.js';
import sumInPreciseDecimal from '../utils/sumInPreciseDecimal.js';

export default (payslipDoc, input) => {
    const payslip = {...payslipDoc.toObject()};

    // sum of hours and earnings that will be updated
    const breakdown = input['breakdown'];
    const sumOfInputHours = sumOfBreakdownValues(breakdown, 'Hours');
    const sumOfInputEarnings = sumOfBreakdownValues(breakdown, 'Earnings');

    // getting the breakdown from payslip that aren't in input
    const inputHourTypes = breakdown.map(items => items['Hour Type']);
    const missingBreakdownFromInput = payslip['Hourly Breakdown']['breakdown']
        .filter(item => !inputHourTypes.includes(item['Hour Type']));

    //sum of the breakdown hours of payslip that aren't from input
    const sumOfNotUpdatedHours = sumOfBreakdownValues(missingBreakdownFromInput, 'Hours');

    // sum of the breakdown earnings of payslip that aren't from input
    const sumOfNotUpdatedEarnings = sumOfBreakdownValues(missingBreakdownFromInput, 'Earnings');

    const totalHours = sumInPreciseDecimal(sumOfInputHours + sumOfNotUpdatedHours);
    const totalEarnings = sumInPreciseDecimal(sumOfInputEarnings + sumOfNotUpdatedEarnings);

    return { hours: totalHours, earnings: totalEarnings };
};