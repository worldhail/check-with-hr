import { describe, expect, it } from "vitest";
import numberOfMonths from "../../../services/numberOfMonths";

describe('Get number of months', () => {
    it ('should return the number of months', () => {
        const result = numberOfMonths({ regularizationDate: '2024-01-9' });

        expect(result).toBe(11);
        expect(result).toBeTypeOf('number');
    });
});