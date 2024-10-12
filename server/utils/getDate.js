export default function getDate(date, now) {
    const payDate = [ 20, 5];
    const secondCutOff_payoutDay = payDate[1];
    const endOf_secondCutOff = 0; // to get end of the month
    let [ year, month ] = [ now.getFullYear(), now.getMonth() ];

    if (date === secondCutOff_payoutDay) month--;
    if (date === endOf_secondCutOff) month++;

    let result = new Date(year, month, date);

    return payDate.includes(date) ? result.toDateString() : result.toLocaleDateString();
};