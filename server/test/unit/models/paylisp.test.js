import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import generatePayslipPeriod from '../../../utils/generatePayslipPeriod.js';
import Payslip from '../../../models/payslip.js';
import mongoose from 'mongoose';

describe('Payslip pre-save hook', () => {
    const id = new mongoose.Types.ObjectId();
    let employee, next, schema;

    beforeEach(() => {
        employee = new Payslip({ "Employee": { 'user': id } });
        next = vi.fn();
        vi.spyOn(employee, 'save').mockImplementation(() => Promise.resolve());

        schema = {
            populate: vi.fn().mockReturnValueOnce(),
            Employee: {
                user: id,
                name: vi.fn().mockReturnValue()
            }
        }
    });

    afterEach(() => vi.clearAllMocks());

    it ('it should generate a payslip period with the employee name', async () => {
        await employee.save();

        generatePayslipPeriod(schema);
        
        const keys = Object.keys(schema['Employee']);
        const expectedKeys = ['Paid Out', 'Pay Period', 'name']
        expectedKeys.forEach((key) => expect(keys).toContain(key));

        const payoutDates = ['5', '20'];
        const resultDate = new Date(schema['Employee']['Paid Out']).getDate().toString();

        let [payPeriodFrom, dash, payPeriodTo] = schema['Employee']['Pay Period'].split(/\s/);
        payPeriodFrom = new Date(payPeriodFrom);
        payPeriodTo = new Date(payPeriodTo);
        
        expect(payPeriodFrom.getTime()).toBeLessThan(payPeriodTo.getTime());
        expect(payPeriodFrom.getMonth()).toEqual(payPeriodTo.getMonth());
        expect(payoutDates).toContain(resultDate);
        next();
        expect(next).toHaveBeenCalled();
    });
});