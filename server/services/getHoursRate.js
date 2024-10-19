// CALCULATE BREAKDOWN EARNINGS FOR HOURS ACCUMULATED
export default function (reqBody, objectName) {
    const breakdown = reqBody[objectName]['breakdown'];
    const reqBodyHourType = breakdown.map(item => item['Hour Type']);
    const earnings = 'Earnings';
    let hourlyRate = 74.747;
    let num;

    // get the index of the object for the hour type for conditional statement below
    const index = (hrType) => breakdown.findIndex(item => item['Hour Type'] === hrType);
    const getHourlyRate = hourType => {
        const hrType = breakdown.filter(type => type['Hour Type'] === hourType);
        return { numberOfHours: (rate) => Number((hrType[0]['Hours'] * rate).toFixed(2)) }
    };

    // each hour type has different calculations and hourly rates
    if (reqBodyHourType.includes('Regular Hours')) {
        num = index('Regular Hours');
        breakdown[num][earnings] = getHourlyRate('Regular Hours').numberOfHours(hourlyRate);
    }
    if (reqBodyHourType.includes('Regular Holiday Hours')) {
        num = index('Regular Holiday Hours');
        breakdown[num][earnings] = getHourlyRate('Regular Holiday Hours').numberOfHours(hourlyRate * 2);
    }
};