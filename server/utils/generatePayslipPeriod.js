import getDates from './getDate.js';

export default function generatePayslipPeriod (dateNow = new Date()) {
    const [ firstCutOff_payoutDay, secondCutOff_payoutDay ] = [ 20, 5];
    const [ startOf_firstCutOff, endOf_firstCutOff ] = [ 1, 15 ];
    const [ startOf_secondCutOff, endOf_secondCutOff ] = [ 16, 0];
    
    // firs cut off pay
    const today = dateNow.getDate();
    if (today > secondCutOff_payoutDay && today <= firstCutOff_payoutDay) {
        return {
            payoutDate: getDates(firstCutOff_payoutDay, dateNow),
            startDate: getDates(startOf_firstCutOff, dateNow),
            endDate: getDates(endOf_firstCutOff, dateNow),
        };
    }

    // second cut off pay
    return {
        payoutDate: getDates(secondCutOff_payoutDay, dateNow),
        startDate: getDates(startOf_secondCutOff, dateNow),
        endDate: getDates(endOf_secondCutOff, dateNow)
    };
};