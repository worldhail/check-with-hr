import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import calculateCreditDifference from "../../../services/calculateCreditDifference.js";

describe('Calculate credit difference', () => {
    let credits;

    beforeEach(() => credits = { toObject: vi.fn().mockReturnValue({ used: 1, available: 5 }) });
    afterEach(() => vi.clearAllMocks() );

    it ('should throw an error - number of leaves should not be greater than the used credits', () => {
        const numberOfLeave = 2;

        expect(() => {
            calculateCreditDifference(credits, numberOfLeave);
        }).toThrow('Should not be greater than the used credits');
    });

    it ('should return new values of used minus from the number of leaves to return in available', () => {
        const numberOfLeave = 1;

        const result = calculateCreditDifference(credits, numberOfLeave);
        expect(result).toEqual({ used: 0, available: 6 });
    });

    it ('should throw an error - only a maximum of available credits', () => {
        credits = { toObject: vi.fn().mockReturnValue({ used: 1, available: 1 }) }
        const numberOfLeave = -2;

        expect( () => calculateCreditDifference(credits, numberOfLeave) )
            .throw(`Only a maximum of ${credits.toObject().available}`);
    });

    it ('should throw an error - only a maximum of available credits', () => {
        credits = { toObject: vi.fn().mockReturnValue({ used: 1, available: 1 }) };
        const numberOfLeave = -1;

        const result = calculateCreditDifference(credits, numberOfLeave) 

        expect(result).toEqual({ used: 2, available: 0 });
    });
});