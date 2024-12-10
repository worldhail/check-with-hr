import { expect, it, vi, afterAll } from "vitest";
import getBreakdownTotal from "../../../services/getBreakdownTotal.js";

afterAll( () => vi.clearAllMocks() );

it ('should return the total hours and earnings', () => {
    const payslip = {
        toObject: vi.fn().mockReturnValue({
            'Hourly Breakdown': {
                breakdown: [
                    { 'Hour Type': 'a', Hours: 8, Earnings: 1 },
                    { 'Hour Type': 'b', Hours: 0, Earnings: 0 },
                    { 'Hour Type': 'c', Hours: 4, Earnings: 1 }
                ]
            }
        })
    };

    const input = { breakdown: [{ 'Hour type': 'b', 'Hours': 8, Earnings: 1 }] }

    const result = getBreakdownTotal(payslip, input);
   
    expect(result.hours).toBeTypeOf('number');
    expect(result.earnings).toBeTypeOf('number');
    expect(result).toEqual({ hours: 20, earnings: 3 });
});