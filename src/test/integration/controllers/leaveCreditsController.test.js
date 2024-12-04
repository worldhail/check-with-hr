import { beforeAll, afterAll, describe, beforeEach, afterEach, it, expect } from 'vitest';
import mongoose from 'mongoose';
import connectToDB from '../../../config/db.js';
import request from 'supertest';
import app from '../../../app.js';
import jwt from 'jsonwebtoken';
import LeaveCredits from '../../../models/leave-credits.js';
import setLeaveCredits from '../../../services/setLeaveCredits.js';

const id = new mongoose.Types.ObjectId().toHexString();
const mockUser = {
    _id: id,
    employeeID: '123456',
    firstName: 'aa',
    middleName: 'bb',
    lastName: 'cc',
    email: 'a@b.com',
    password: '12345678',
    department: 'aaaaa',
    position: 'aa',
    hireDate: '2024-01-15',
    address: {
        street: 'aaa',
        barangay: 'aaa',
        city: 'aaa',
        province: 'aaa',
        zipCode: 'aaa',
    },
    employmentStatus: 'aaaaa',
    role: 'employee',
};

beforeAll(async () => await connectToDB() );
afterAll(async () => await mongoose.disconnect() );

describe('GET - get leave credits', () => {
    let user, token;

    beforeEach(() => {
        user = { _id: mockUser._id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
    });

    afterEach( async () => await LeaveCredits.deleteOne({ user: mockUser._id }) );

    it('should return no leave credits or regularization date added', async () => {
        const response = await request(app)
            .get('/api/user/leave-credits')
            .set('Cookie', [`x-auth-token=${token}`])

        expect(response.status).toBe(404);
        expect(response.text).toBe('No leave credits or regularization date added');
    });

    it('should return the leave credits', async () => {
        await setLeaveCredits(mockUser._id, { regularizationDate: '2024-01-15', used: 1 });

        const response = await request(app)
            .get('/api/user/leave-credits')
            .set('Cookie', [`x-auth-token=${token}`])

        const result = JSON.parse(response.text);
        const expectedProps = [ 'user', '_id', 'used', 'available', 'total' ];

        expect(response.status).toBe(200);
        expectedProps.forEach(item => {
            expect(result).toHaveProperty(item);
        });
        expect(result).toHaveProperty('user')
    });
});