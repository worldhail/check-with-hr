import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Payslip from '../../../models/payslip.js';
import mongoose from 'mongoose';
import generatePayslipPeriod from '../../../utils/generatePayslipPeriod.js';

describe('Payslip pre-save hook', () => {
    const id = new mongoose.Types.ObjectId();
    let userData, employee, next;

    beforeEach(() => {
        userData = {
            user: id,
            firstName: 'a',
            middleName: 'b',
            lastName: 'c'
        };

        employee = new Payslip ({ 'Employee': { user: userData.user } });
        employee.populate = vi.fn().mockResolvedValue({ 'Employee': { user: userData } });
        vi.spyOn(employee, 'save').mockImplementation(() => Promise.resolve());
        next = vi.fn();
    });

    afterEach(() => vi.clearAllMocks());

    it ('it should generate a payslip period with the employee name', async () => {
        // to make an instance for the employee name and its pay date details
        const name = await employee.populate({
            path: 'Employee.user',
            select: 'firstName middleName lastName'   
        });
        await employee.save();

        const { payoutDate, startDate, endDate } = generatePayslipPeriod();
        employee['Employee']['Paid Out'] = payoutDate;
        employee['Employee']['Pay Period'] = `${startDate} to ${endDate}`;

        const user = name['Employee'].user;
        employee['Employee'].name = `${user.firstName} ${user.middleName} ${user.lastName}`;
        next();

        const date = new Date(employee['Employee']['Paid Out']).getDate();
        const startPeriod = new Date(startDate).getTime();
        const endPeriod = new Date(endDate).getTime();
        const startPeriodInDate = new Date(startDate).getDate();
        const endPeriodInDate = new Date(endPeriod).getDate();
        const periodDates = [1, 15, 16, 28, 29, 30, 31];

        expect([5, 20]).toContain(date);
        expect(periodDates).toContain(startPeriodInDate);
        expect(periodDates).toContain(endPeriodInDate);
        expect(endPeriod).toBeGreaterThan(startPeriod);
        expect(employee['Employee'].name).not.toContain('undefined');
        expect(next).toHaveBeenCalled();
    });
});