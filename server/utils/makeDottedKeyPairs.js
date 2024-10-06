// Setting the properties of the nested object with dot notation
export default function (reqBody, objectName) {
    let result;

    if (objectName === 'Hourly Breakdown') {
        const breakdownEntries = reqBody[objectName]['breakdown'];
        const reqBodyHourType = breakdownEntries.map(items => items['Hour Type']);
        const breakdown = [];
        const reqBodyarrayFilters = [];
        for (let i = 0; reqBodyHourType.length > i; i++) {
            // get the item object accordingly to make an identifier for the arrayFilter
            const fromHourTypeObject = breakdownEntries.filter(item => item['Hour Type'] === reqBodyHourType[i]);
            const identifier = reqBodyHourType[i]
                .split(/\W/)
                .join('')
                .replace(/[^]/, reqBodyHourType[i][0].toLowerCase()); 

            // push the new updates into dotted notation with the identifier for object convertion
            breakdown.push([`Hourly Breakdown.breakdown.$[${identifier}].Hours`, fromHourTypeObject[0]['Hours']]);
            breakdown.push([`Hourly Breakdown.breakdown.$[${identifier}].Earnings`, fromHourTypeObject[0]['Earnings']]);
            reqBodyarrayFilters.push({ [`${identifier}.Hour Type`]: reqBodyHourType[i] });
        }

        // convert the array into objects and return 2 properties to pass sets of updates with updateOne method
        const { newBreakdown } = { newBreakdown: Object.fromEntries(breakdown) };
        result = { newBreakdown, reqBodyarrayFilters};
    } else {
        // convert the object key value pairs in an array
        const objEntries = Object.entries(reqBody[objectName]);

        // connect the nested object property to it's child properties with dot notation on a string
        const keyPairs = objEntries.map(([keys, values]) => [`${objectName}.${keys}`, values]);
        result = keyPairs;
    }

    return result;
};