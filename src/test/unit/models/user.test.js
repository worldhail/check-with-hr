import { describe, it, expect, beforeEach, vi, afterEach  } from 'vitest';
import User from '../../../models/user.js';
import jwt from 'jsonwebtoken';
import getTenurity from '../../../services/getTenurity.js';

describe('generateAuthToken', () => {
    let user;
    const email = 'a@mail.com';

    beforeEach(() => {
        user = new User({ role: 'employee', hireDate: '2023-01-15' });
        vi.spyOn(user, 'save').mockImplementation(() => Promise.resolve());
    });

    afterEach(() => { vi.clearAllMocks() });

    it ('should generate an Auth token', async () => {
        await user.save();

        const token = user.generateAuthToken();
        const decode = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

        expect(token).toBeDefined();
        expect(decode).toHaveProperty('role');
        expect(decode).toHaveProperty('_id');
    });

    it ('should generate a verification token', async () => {
        await user.save();

        const token = user.getVerificationToken(email);
        const decode = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

        expect(token).toBeDefined();
        expect(decode).toHaveProperty('role');
        expect(decode).toHaveProperty('email');
        expect(decode).toHaveProperty('exp');
    });

    it ('should get the tenurity in years and/or months', async () => {
        await user.save();
        const next = vi.fn();

        const { years, months } = getTenurity(user.hireDate);
        user.tenurity = { years, months };

        expect(years).toBeTypeOf('number');
        expect(months).toBeTypeOf('number');
        expect(user.tenurity).toHaveProperty('years');
        expect(user.tenurity).toHaveProperty('months');
        next();
        expect(next).toHaveBeenCalled();
    });
});