import getHourType from "./getHourType.js";

// CALCULATE BREAKDOWN EARNINGS FOR HOURS ACCUMULATED
export default async function (reqBody, objectName) {
    const breakdown = reqBody[objectName]['breakdown'];
    const reqBodyHourType = breakdown.map(item => item['Hour Type']);
    const availableHourType = await getHourType();

    // get the index of the object for the hour type from the input
    const index = (hrType) => breakdown.findIndex(item => item['Hour Type'] === hrType);
    const getHourlyRate = hourType => {
        const hrType = breakdown.filter(type => type['Hour Type'] === hourType);
        return { numberOfHours: (rate) => Number((hrType[0]['Hours'] * rate).toFixed(2)) }
    };

    // each hour type has different calculations and hourly rates
    for (let i = 0; reqBodyHourType.length > i; i++) {
        const num = index(reqBodyHourType[i]);
        const hourlyRate = availableHourType.hourTypes
            .filter(type => type.name === reqBodyHourType[i])[0]
            .ratePerHour;

        breakdown[num]['Earnings'] = getHourlyRate(reqBodyHourType[i]).numberOfHours(hourlyRate);
    }
};