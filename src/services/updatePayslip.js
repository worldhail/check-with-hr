import Payslip from "../models/payslip.js";

export default (id, keypairs, arrayFilters) => {
    const arrFilter = { arrayFilters } ?? null;
    return Payslip.updateOne({ 'Employee.user': id }, { $set: keypairs }, arrFilter);
};