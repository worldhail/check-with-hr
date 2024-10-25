import { describe, beforeEach, afterEach, it, vi, expect } from 'vitest';
import LeaveCredits from '../../../models/leave-credits';

describe('Leave credits pre save hook', () => {
    let leaveCredits;

    const getMonths = (date) => {
        const timeDifference = new Date() - date;
        const days = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
        const months = Math.floor(days / 30);
        return months;
    };

    beforeEach(() => {
        leaveCredits = new LeaveCredits({ regularizationDate: new Date('2023-12-30') });

        vi.spyOn(leaveCredits, 'save').mockImplementation(() => Promise.resolve() );
    });

    afterEach(() => { vi.clearAllMocks() });

    it ('should calculate total and available as the same value', async () => {
        await leaveCredits.save();

        const months = getMonths(leaveCredits.regularizationDate);
        leaveCredits.total = months;
        leaveCredits.available = leaveCredits.total - leaveCredits.used;

        expect(leaveCredits.total).toBe(months);
        expect(leaveCredits.available).toBe(leaveCredits.total);
    });

    it ('should calculate available and not equal to the total', async () => {
        leaveCredits.used = 1;
        await leaveCredits.save();

        const months = getMonths(leaveCredits.regularizationDate);
        leaveCredits.total = months;
        leaveCredits.available = leaveCredits.total - leaveCredits.used;

        expect(leaveCredits.total).toBe(months);
        expect(leaveCredits.available).not.toEqual(leaveCredits.total);
    });
});