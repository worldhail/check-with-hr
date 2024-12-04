import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import request from 'supertest';
import app from '../../../app.js';
import mongoose from "mongoose";
import connectToDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
import User from "../../../models/user.js";
import LeaveCredits from "../../../models/leave-credits.js";
import setLeaveCredits from "../../../services/setLeaveCredits.js";

const mockUser = {
    employeeID: 'employeeID3',
    firstName: 'aa',
    middleName: 'bb',
    lastName: 'cc',
    email: 'email@1.com',
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

describe('GET - get user documents', () => {
    let admin, token;

    beforeEach( async () => {
        admin = { _id: new mongoose.Types.ObjectId().toHexString(), role: 'admin' };
        token = jwt.sign(admin, process.env.JWT_PRIVATE_KEY);

        const id = new mongoose.Types.ObjectId().toHexString();
        mockUser._id = id;
        await User.create(mockUser);
    });

    afterEach( async () => await User.deleteOne({ email: 'email@1.com' }) );

    it ('should return no seach parameters setup', async () => {
        const response = await request(app)
            .get('/api/admin/user-docs')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                // "employeeID": "",
                "firstName": "",
                "middleName": ""
            });
        
        expect(response.status).toBe(400);
        expect(response.text).toBe('No search parameters setup');
    });

    it ('should return no results found', async () => {
        const response = await request(app)
            .get('/api/admin/user-docs')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                // "employeeID": "",
                "firstName": "name",
                "middleName": ""
            });
        
        expect(response.status).toBe(404);
        expect(response.text).toBe('No results found');
    });

    it ('should retun the user document/s', async () => {
        const response = await request(app)
            .get('/api/admin/user-docs')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                employeeID: "employeeID3",
                "firstName": "aa",
                "middleName": ""
            });

        const result = JSON.parse(response.text);

        expect(response.status).toBe(200);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('firstName');
    });
});

describe('POST - create leave credits', () => {
    let admin, token, id;

    beforeEach( async () => {
        admin = { _id: new mongoose.Types.ObjectId().toHexString(), role: 'admin' };
        token = jwt.sign(admin, process.env.JWT_PRIVATE_KEY);

        id = new mongoose.Types.ObjectId().toHexString();
        mockUser._id = id;
        mockUser.employeeID = 'employeeID4';
        mockUser.email = 'email@2.com';
        await User.create(mockUser);
    });

    afterEach( async () => {
        await User.deleteOne({ email: 'email@2.com' });
        await LeaveCredits.deleteOne({ user: id });
    });

    it ('should return user not found', async () => {
        const fakeId = 'a'.repeat(24);

        const response = await request(app)
            .post(`/api/admin/user-doc/credits/set/${fakeId}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ regularizationDate: '2024-01-15' });
        
        expect(response.status).toBe(400);
        expect(response.text).toBe('User not found');
    });

    it ('should create new leave credits', async () => {
        const response = await request(app)
            .post(`/api/admin/user-doc/credits/set/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ regularizationDate: '2024-01-15' });
        
        const result = JSON.parse(response.text);
        const expectedProps = [ '_id', 'user', 'regularizationDate', 'used', 'available', 'total' ];

        expect(response.status).toBe(201);
        expectedProps.forEach(props => expect(result).toHaveProperty(props));
    });
});

describe('PATCH - update leave credits', () => {
    let admin, token, id;

    beforeEach( async () => {
        admin = { _id: new mongoose.Types.ObjectId().toHexString(), role: 'admin' };
        token = jwt.sign(admin, process.env.JWT_PRIVATE_KEY);

        id = new mongoose.Types.ObjectId().toHexString();
        mockUser._id = id;
        mockUser.employeeID = 'employeeID5';
        mockUser.email = 'email@3.com';
        await User.create(mockUser);
    });

    afterEach( async () => {
        await User.deleteOne({ email: 'email@3.com' });
        await LeaveCredits.deleteOne({ user: id });
    });

    it ('should return no user credits found', async () => {
        const response = await request(app)
            .patch(`/api/admin/user-doc/credits/update/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ available: -2 });

        expect(response.status).toBe(400);
        expect(response.text).toBe('No user credits found');
    });

    it ('should update the leave credits', async () => {
        await setLeaveCredits(id, { regularizationDate: '2024-02-01' });

        const response = await request(app)
            .patch(`/api/admin/user-doc/credits/update/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ available: -2 });

        const result = JSON.parse(response.text);

        expect(response.status).toBe(200);
        expect(result.acknowledged).toBeTruthy();
    });
});