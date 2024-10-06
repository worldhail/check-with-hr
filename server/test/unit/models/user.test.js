import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import User from '../../../models/user';
import mongoose from 'mongoose';

describe('generateAuthToken', () => {
    let user;

    beforeEach(() => {
        // without joi validation
        user = new User({ 
            role: 'employee', 
            _id: new mongoose.Types.ObjectId(),
            employeeID: '1',
            firstName:'a',
            employmentStatus: 'a',
            hireDate: new Date(),
            position: 'a',
            department: 'a',
            password: 'a',
            email: 'a',
            lastName: 'a',
            middleName: 'a',
            address: {
                street: 'a',
                barangay: 'a',
                city: 'a',
                province: 'a',
                zipCode: 'a',
            }
        });

        vi.spyOn(user, 'save').mockImplementation(() => Promise.resolve());
    });

    afterEach(() => vi.clearAllMocks());

    it ('should generate a token', async () => {
        await user.save();
        
        const token = user.generateAuthToken();

        expect(jwt.sign).toHaveBeenCalledWith({ _id: user._id, role: user.role }, 'test');
    });
});