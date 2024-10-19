export default input => {
    const inputBreakdownEntries = input['breakdown'];
    const inputHourTypes = inputBreakdownEntries.map(items => items['Hour Type']);
    const breakdown = [];
    const inputArrayFilters = [];

    for (let i = 0; inputHourTypes.length > i; i++) {
        // get the item object accordingly to make an identifier for the arrayFilter
        const hourType = inputBreakdownEntries.filter(item => item['Hour Type'] === inputHourTypes[i]);

        // remove spaces and make first letter a lowercase
        const identifier = inputHourTypes[i]
            .split(/\W/)
            .join('')
            .replace(/[^]/, inputHourTypes[i][0].toLowerCase()); 

        // push the new updates into dotted notation with the identifier for object convertion
        breakdown.push([`Hourly Breakdown.breakdown.$[${identifier}].Hours`, hourType[0]['Hours']]);
        breakdown.push([`Hourly Breakdown.breakdown.$[${identifier}].Earnings`, hourType[0]['Earnings']]);
        inputArrayFilters.push({ [`${identifier}.Hour Type`]: inputHourTypes[i] });
    }

    // convert the array into objects and return 2 properties to pass sets of updates with updateOne method
    const { newBreakdown } = { newBreakdown: Object.fromEntries(breakdown) };
    return { newBreakdown, inputArrayFilters };
}