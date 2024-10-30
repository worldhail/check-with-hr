export default function getDate(billingDates, dateNow) {
    const payDate = [ 20, 5];
    const firstCutOff_payoutDay = payDate[0];
    const secondCutOff_payoutDay = payDate[1];
    const [ startOf_secondCutOff, endOf_secondCutOff ] = [ 16, 0 /*zero to get end of the month*/];
    let [ year, month, today ] = [ dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() ];

    if (today > firstCutOff_payoutDay) {
        if (billingDates === secondCutOff_payoutDay || billingDates === endOf_secondCutOff) month++;
    };

    if (today <= secondCutOff_payoutDay && billingDates === startOf_secondCutOff) month--

    let result = new Date(year, month, billingDates);

    return payDate.includes(billingDates) ? result.toDateString() : result.toLocaleDateString();
};