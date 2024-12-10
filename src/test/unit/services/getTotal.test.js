import { describe, expect, it, vi } from "vitest";
import getTotal from "../../../services/getTotal";

describe('Get Total', () => {
    it ('should return the sum of the payslip categories', () => {
        const payslip = {
            toObject: vi.fn().mockReturnValue({
                'Property Name': {
                    subProp1: 0,
                    subProp2: 1,
                    subProp3: 1,
                    'Total subProp': 0
                },
                _id: 1
            })
        };

        const input = {
            'Property Name': {
                subProp1: 1,
                subProp3: 3
            }
        };

        const result = getTotal(payslip, 'Property Name', input);

        expect(result).toBe(5);
        expect(result).toBeTypeOf('number');
    });
});