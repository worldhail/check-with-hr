import { it, expect } from "vitest";
import breakdownDottedKeypairs from "../../../services/breakdownDottedKeypairs.js";


it('should make dotted keypairs for hourly breakdown with identifier', () => {
    const { newBreakdown, inputArrayFilters } = breakdownDottedKeypairs({
        breakdown: [
            { 'Hour Type': 'a', Hours: 1, Earnings: 5 },
            { 'Hour Type': 'b', Hours: 2, Earnings: 10 }, 
            { 'Hour Type': 'c', Hours: 3, Earnings: 15 }
        ]
    });

    expect(newBreakdown).toHaveProperty("Hourly Breakdown.breakdown.$[a].Earnings");
    expect(newBreakdown).toHaveProperty("Hourly Breakdown.breakdown.$[a].Hours");
    expect(inputArrayFilters).toEqual(
        expect.arrayContaining([ expect.objectContaining({ 'a.Hour Type': 'a' }) ])
    );
});
