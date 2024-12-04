import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import request from 'supertest';
import app from '../../../app.js';
import mongoose from "mongoose";
import connectToDB from '../../../config/db.js';
import User from "../../../models/user.js";

const id = new mongoose.Types.ObjectId().toHexString();
const mockAuthorizeUser = {
    _id: id,
    employeeID: 'existingId1234',
    firstName: 'aa',
    middleName: 'bb',
    lastName: 'cc',
    email: 'existing@email.com',
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
afterAll(async () => await mongoose.disconnect() )

describe('GET - verify email', () => {
    beforeEach( async () => await User.create(mockAuthorizeUser) );
    afterEach( async () => await User.deleteOne({ email: 'existing@email.com' }) )

    it('should return an invalid request', async () => {
        const response = await request(app)
            .get('/api/verify/user/complete')

        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid request');
    });

    it('should return user not found or token has expired', async () => {
        const response = await request(app)
            .get('/api/verify/user/complete?token=fakeToken1')

        expect(response.status).toBe(404);
        expect(response.text).toBe('User not found or token has expired');
    });

    it('should return user is already verified', async () => {
        const user = await User.findOne({ email: 'existing@email.com' });
        const token = user.verificationToken;
        user.isVerified = true;
        await user.save();

        const response = await request(app)
            .get(`/api/verify/user/complete?token=${token}`)

        expect(response.status).toBe(400);
        expect(response.text).toBe('User is already verified');
    });

    it('should make the user verified', async () => {
        const user = await User.findOne({ email: 'existing@email.com' });
        const response = await request(app)
            .get(`/api/verify/user/complete?token=${user.verificationToken}`)

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/api/login/user');
    });
});