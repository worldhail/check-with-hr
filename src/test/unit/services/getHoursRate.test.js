import { describe, expect, it, vi } from "vitest";
import getHourType from "../../../services/getHourType";
import getHoursRate from "../../../services/getHoursRate";

describe('Get hours rate', () => {
    vi.mock("../../../services/getHourType");

    it ('should calculate the hours rate to become the earning value', async () => {
        getHourType.mockResolvedValue({
            hourTypes: [
                { name: 'a', ratePerHour: 15 },
                { name: 'b', ratePerHour: 5 },
                { name: 'c', ratePerHour: 10 },
            ]
        });

        const input = {
            'Hourly Breakdown': {
                breakdown: [
                    { 'Hour Type': 'b', Hours: 2 },
                    { 'Hour Type': 'c', Hours: 8 }
                ]
            }
        }

        await getHoursRate(input, 'Hourly Breakdown');
        const result = input['Hourly Breakdown']['breakdown'].every(keys => typeof keys['Earnings'] === 'number');

        expect(result).toBeTruthy();
        expect(input).toEqual({
            'Hourly Breakdown': {
                breakdown: [
                    { 'Hour Type': 'b', Hours: 2, Earnings: 10 },
                    { 'Hour Type': 'c', Hours: 8, Earnings: 80 }
                ]
            }
        });
    });
})