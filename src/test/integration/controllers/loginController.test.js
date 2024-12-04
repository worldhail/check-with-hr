import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import request from 'supertest';
import app from '../../../app.js';
import mongoose from "mongoose";
import connectToDB from '../../../config/db.js';
import User from "../../../models/user.js";
import hashPassword from "../../../services/hashPassword.js";

beforeAll(async () => await connectToDB() );
afterAll(async () => await mongoose.disconnect() )

describe('POST - login', () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const mockPassword = '12345678';
    const mockAuthorizeUser = {
        _id: id,
        employeeID: '1234567',
        firstName: 'aa',
        middleName: 'bb',
        lastName: 'cc',
        email: 'sample@email.com',
        password: mockPassword,
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

    beforeEach( async () => {
        mockAuthorizeUser.password = await hashPassword(mockPassword);
        await User.create(mockAuthorizeUser);
    });

    afterEach( async () => {
        await User.deleteOne({ _id: mockAuthorizeUser._id });
    })

    it ('should return invalid email or password when email does not exist', async () => {
        const response = await request(app)
            .post('/api/login/user')
            .send({
                email: 'my@email.com',
                password: '123456789',
                role: 'employee'
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid email or password');
    });

    it ('should return invalid email or password when role does not match to the credentials', async () => {
        const response = await request(app)
            .post('/api/login/user')
            .send({
                email: 'sample@email.com',
                password: '123456789',
                role: 'admin'
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid email or password');
    });

    it ('should return invalid email or password when password is incorrect', async () => {
        const response = await request(app)
            .post('/api/login/user')
            .send({
                email: 'sample@email.com',
                password: '123456789',
                role: 'employee'
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid email or password');
    });

    it ('should login the user and return the profile info', async () => {
        const response = await request(app)
            .post('/api/login/user')
            .send({
                email: 'sample@email.com',
                password: '12345678',
                role: 'employee'
            });
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/api/account-routes/profile');
    });
});