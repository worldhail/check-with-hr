import Payslip from "../models/payslip.js";
import getHourType from "./getHourType.js";
import debug from 'debug';
const debugAdmin = debug('app:admin');

export default async function (id) {
    debugAdmin('No payslip found, generated a new payslip template');

    const hourTypeDocument = await getHourType();
    const hourType = hourTypeDocument.hourTypes.map(type => type.name);

    return new Payslip({
        'Employee.user': id,
        'Hourly Breakdown': { 
            'breakdown': hourType.map(type => ({ 'Hour Type': type, 'Hours': 0, 'Earnings': 0 }))
        }
    }).save();
};