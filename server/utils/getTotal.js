// sum of the nested objects from the saved values and new input values
export default function (reqBody, objectName, savedObject) {
    let result;

    if (objectName === 'Hourly Breakdown') {
        // sum of hours and earnings that will be updated
        const breakdown = reqBody[objectName]['breakdown'];
        const reqBodyHourTypes = breakdown.map(items => items['Hour Type']);
        const sumOfNewHours = breakdown.map(items => items['Hours']).reduce((accu, curr) => accu + curr, 0);
        const sumOfNewEarnings = breakdown.map(items => items['Earnings']).reduce((accu, curr) => accu + curr, 0);

        // getting all the hours and earnings that will not be updated
        const unchangedHourTypes = savedObject['breakdown']
            .filter(item => !reqBodyHourTypes.includes(item['Hour Type']));

        //sum of the updated and not updated values to get an instant total
        const sumOfNotUpdatedHours = unchangedHourTypes
            .map(item => item['Hours'])
            .reduce((accu, curr) => accu + curr, 0);;
        const sumOfNotUpdatedEarnings = unchangedHourTypes
            .map(item => item['Earnings'])
            .reduce((accu, curr) => accu + curr, 0);;
        const totalHours = sumOfNewHours + sumOfNotUpdatedHours;
        const totalEarnings = sumOfNewEarnings + sumOfNotUpdatedEarnings;
        result = { hours: totalHours, earnings: totalEarnings };
    } else {
        // convert the object key value pairs in an array
        const reqBodykeyPairs = Object.entries(reqBody[objectName]);
        const saveObjectKeyPairs = Object.entries(savedObject[objectName]._doc);

        // filter out the properties that are not going to be updated
        // and push them to an array with the properties that will be updated
        const unchangedValues =  saveObjectKeyPairs
            .filter(([keys, values]) => keys !== `Total ${objectName}` && keys !== '_id')
            .filter(([keys, values]) => !reqBody[objectName].hasOwnProperty(keys))
            .forEach(items => reqBodykeyPairs.push(items));
        
        // get the values of the properties and add them up
        const values = reqBodykeyPairs.map(([keys, values]) => values);
        const sum = Number(values.reduce((acc, curr) => acc + curr, 0).toFixed(2));
        result = sum;
    }

    return result;
};