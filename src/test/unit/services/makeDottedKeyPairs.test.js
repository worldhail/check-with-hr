import { describe, expect, it } from "vitest";
import makeDottedKeyPairs from "../../../services/makeDottedKeyPairs";

describe('Make dotted key pairs', () => {
    it ('should return a dotted keypairs with the total value', () => {
        const total = 2;
        const input = {
            "Property Name": {
                subProp1: 1,
                subProp2: 1,
            }
        };

        const result = makeDottedKeyPairs(total, input, 'Property Name');
        const allValues = Object.values(result).every(value => typeof value === 'number');

        expect(result).toHaveProperty('Property Name.subProp1');
        expect(result).toHaveProperty('Property Name.subProp2');
        expect(result).toHaveProperty('Property Name.Total Property Name');
        expect(allValues).toBeTruthy();
    });
});