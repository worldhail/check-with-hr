import Payslip from "../models/payslip.js";
import debug from 'debug';
const debugAdmin = debug('app:admin');

export default function (id) {
    debugAdmin('No payslip found, generated a new payslip template');
    return new Payslip({ 'Employee.user': id }).save();
};