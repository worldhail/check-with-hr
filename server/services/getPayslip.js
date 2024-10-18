import Payslip from "../models/payslip.js";
import debug from 'debug';
const debugAdmin = debug('app:admin');

export default function(id) {
    debugAdmin('Retrieving payslip...');
    return Payslip.findOne({ 'Employee.user': id });
};