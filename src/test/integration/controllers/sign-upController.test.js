import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import request from 'supertest';
import app from '../../../app.js';
import mongoose from "mongoose";
import connectToDB from '../../../config/db.js';
import User from "../../../models/user.js";

const id = new mongoose.Types.ObjectId().toHexString();
const mockUser = {
    _id: id,
    employeeID: 'existingId123',
    firstName: 'aa',
    middleName: 'bb',
    lastName: 'cc',
    email: 'existing1@email.com',
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

describe('POST - sign-up', () => {
    beforeEach( async () => await User.create(mockUser) );
    afterEach( async () => await User.deleteMany({ email: { $in: [ 'existing1@email.com', 'new@email.com' ] }}) );

    it ('should return email is already registered', async () => {
        const newMockUser = { ...mockUser };
        delete newMockUser._id;

        const response = await request(app)
            .post('/api/sign-up/user')
            .send(newMockUser);

        expect(response.status).toBe(400);
        expect(response.text).toBe('Email is already registered.');
    });

    it ('should return employeeID is already registered', async () => {
        const newMockUser = { ...mockUser };
        delete newMockUser._id;
        newMockUser.email = 'new@email.com';

        const response = await request(app)
            .post('/api/sign-up/user')
            .send(newMockUser);

        expect(response.status).toBe(400);
        expect(response.text).toBe('EmployeeID is already registered.');
    });

    it ('should sign-up the user', async () => {
        const newMockUser = { ...mockUser };
        delete newMockUser._id;
        newMockUser.email = 'new@email.com';
        newMockUser.employeeID = 'newEmployeeID123';

        const response = await request(app)
            .post('/api/sign-up/user')
            .send(newMockUser);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/api/new/email-send');
    });
});