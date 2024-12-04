import { describe, vi, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import request from 'supertest';
import app from '../../../app.js';
import mongoose from "mongoose";
import connectToDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
import User from "../../../models/user.js";
import hashPassword from "../../../services/hashPassword.js";

const id = new mongoose.Types.ObjectId().toHexString();
const mockPassword = '12345678';
const mockAuthorizeUser = {
    _id: id,
    employeeID: '12345',
    firstName: 'aa',
    middleName: 'bb',
    lastName: 'cc',
    email: 'a@b.com',
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

beforeAll(async () => await connectToDB() );
afterAll(async () => await mongoose.disconnect() )

describe('GET - profile', () => {
    let user, token;

    // BEFORE AND AFTEREACH
    beforeEach(async () => {
        user = { _id: id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
    });

    afterEach(async () => {
        await User.deleteOne({ _id: id});
        vi.clearAllMocks();
    });

    // IT METHOD
    it ('should return user not found', async () => {
        const response = await request(app)
            .get('/api/account-routes/profile')
            .set('Cookie', [`x-auth-token=${token}`])

        expect(response.status).toBe(404);
        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([ expect.stringContaining(`x-auth-token=;`) ])
        );
        expect(response.text).toBe('User not found');
    })

    // IT METHOD
    it ('should return the profile information', async () => {
        await User.create(mockAuthorizeUser);

        const response = await request(app)
            .get('/api/account-routes/profile')
            .set('Cookie', [`x-auth-token=${token}`])

        expect(response.status).toBe(200);
        expect(response.text).toBeDefined();
    })
});

describe('POST - verify password', () => {
    let user, token;

    // BEFORE AND AFTEREACH
    beforeEach(async () => {
        user = { _id: id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
        
        const hashedMockPassword = await hashPassword(mockPassword);
        mockAuthorizeUser.password = hashedMockPassword;
        await User.create(mockAuthorizeUser);
    });

    afterEach(async () => {
        await User.deleteOne({ _id: id});
        vi.clearAllMocks();
    });

    // IT METHOD
    it ('should return incorrect password', async () => {
        const response = await request(app)
            .post('/api/account-routes/current-password')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ password: "123456789" });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Incorrect password');
    });

    it ('should redirect to /api/account-routes/email', async () => {
        const response = await request(app)
            .post('/api/account-routes/current-password')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ password: "12345678" });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/api/account-routes/email');
    });
});

describe('POST - logout', () => {
    let user, token;

    beforeEach(() => {
        user = { _id: id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
    });

    afterEach(async () => {
        await User.deleteOne({ _id: id});
        vi.clearAllMocks();
    });

    it ('should redirect to login page, and cleared out the token access and session', async () => {
        const response = await request(app)
            .post('/api/account-routes/logout')
            .set('Cookie', [`x-auth-token=${token}`]);

        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([ expect.stringContaining(`x-auth-token=;`) ])
        );
        expect(response.session).toBeUndefined();
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/api/login/user');
    });
});

describe('PUT - update email', () => {
    const newId = new mongoose.Types.ObjectId().toHexString();
    let user, token, hashedMockPassword;

    beforeEach(async() => {
        hashedMockPassword = await hashPassword(mockPassword);
        mockAuthorizeUser.password = hashedMockPassword;
    });

    afterEach(async () => {
        await User.deleteMany({ _id: { $in: [ id, newId ] } });
        vi.clearAllMocks();
    });

    it ('should return user not found', async () => {
        user = { _id: new mongoose.Types.ObjectId(), role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
        await User.create(mockAuthorizeUser);

        const response = await request(app)
            .put('/api/account-routes/email')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ newEmail: 'new@email.com'});
        
        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([ expect.stringContaining(`x-auth-token=;`) ])
        )
        expect(response.status).toBe(404);
        expect(response.text).toBe('User not found');
    });

    it ('should ask for a new email or not to proceed in changing email', async () => {
        // id now exist
        user = { _id: mockAuthorizeUser._id, role: 'employee' }
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
        await User.create(mockAuthorizeUser);

        const response = await request(app)
            .put('/api/account-routes/email')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ newEmail: 'a@b.com'});

        expect(response.status).toBe(400);
        expect(response.text).toBe('Please provide a new email or cancel if you do not want to change it.');
    });

    it ('should return email already registered', async () => {
        user = { _id: mockAuthorizeUser._id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
        await User.create(mockAuthorizeUser);

        //inserting new user with new email
        const otherUser = { ...mockAuthorizeUser };
        otherUser.email = 'existing@email.com';
        otherUser._id = newId;
        otherUser.employeeID = 2;
        await User.create(otherUser);

        const response = await request(app)
            .put('/api/account-routes/email')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ newEmail: 'existing@email.com' });
        
        expect(response.status).toBe(400);
        expect(response.text).toBe('Email is already registered.');
    });

    it ('should update the email', async () => {
        user = { _id: mockAuthorizeUser._id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
        await User.create(mockAuthorizeUser);

        const response = await request(app)
            .put('/api/account-routes/email')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ newEmail: 'new@email.com' });

        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([ expect.stringContaining('x-auth-token=;') ])
        );
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/api/new/email-send');
    });
});

describe('PUT - update password', () => {
    let user, token, hashedMockPassword;

    beforeEach(async() => {
        hashedMockPassword = await hashPassword(mockPassword);
        mockAuthorizeUser.password = hashedMockPassword;

        user = { _id: mockAuthorizeUser._id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
        await User.create(mockAuthorizeUser);
    });

    afterEach(async () => {
        await User.deleteMany({ _id: mockAuthorizeUser._id });
        vi.clearAllMocks();
    });

    it ('should return an invalid current password', async () => {
        const response = await request(app)
            .put('/api/account-routes/password')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                currentPassword: 'abcdefgh',
                newPassword: '123456789',
                confirmNewPassword: '123456789'
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid current password');
    })

    it ('should return new password should not be the same as current password', async () => {
        const response = await request(app)
            .put('/api/account-routes/password')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                currentPassword: mockPassword,
                newPassword: mockPassword,
                confirmNewPassword: mockPassword
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe('New password must not be the same as the current password');
    });

    it ('should return confirmed password does not match', async () => {
        const response = await request(app)
            .put('/api/account-routes/password')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                currentPassword: mockPassword,
                newPassword: "123456789",
                confirmNewPassword: mockPassword
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Confirmed password does not match');
    });

    it ('should update the password', async () => {
        const response = await request(app)
            .put('/api/account-routes/password')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                currentPassword: mockPassword,
                newPassword: "123456789",
                confirmNewPassword: "123456789"
            });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/api/login/user');
    });
});

describe('PUT - update personal information', () => {
    const newId = new mongoose.Types.ObjectId().toHexString();
    let user, token, hashedMockPassword;

    beforeEach(async() => {
        hashedMockPassword = await hashPassword(mockPassword);
        mockAuthorizeUser.password = hashedMockPassword;
    });

    afterEach(async () => {
        await User.deleteMany({ _id: { $in: [ id, newId ] } });
        vi.clearAllMocks();
    });

    it ('should return employeeID is already registered', async () => {
        user = { _id: mockAuthorizeUser._id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
        await User.create(mockAuthorizeUser);

        const personalInfo = {
            employeeID: '123456',
            firstName: 'aa',
            middleName: 'bb',
            lastName: 'cc',
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
        }

        mockAuthorizeUser.employeeID = '123456';
        mockAuthorizeUser._id = newId;
        mockAuthorizeUser.email = 'another@email.com'
        await User.create(mockAuthorizeUser);
        
        const response = await request(app)
            .put('/api/account-routes/personal-info')
            .set('Cookie', [`x-auth-token=${token}`])
            .send(personalInfo);

        expect(response.status).toBe(400);
        expect(response.text).toBe('EmployeeID is already registered.');
    });

    it ('should update the personal information', async () => {
        user = { _id: mockAuthorizeUser._id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
        await User.create(mockAuthorizeUser);

        const personalInfo = {
            employeeID: '123456',
            firstName: 'new',
            middleName: 'new',
            lastName: 'new',
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
        }
        
        const response = await request(app)
            .put('/api/account-routes/personal-info')
            .set('Cookie', [`x-auth-token=${token}`])
            .send(personalInfo);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/api/account-routes/profile');
    });
});

describe('DELETE - delete the account', () => {
    let user, token;

    beforeEach(async () => {
        user = { _id: mockAuthorizeUser._id, role: 'employee' };
        token = jwt.sign(user, process.env.JWT_PRIVATE_KEY);
    });

    afterEach(async () => {
        await User.deleteOne({ _id: id});
        vi.clearAllMocks();
    });

    it ('should return user not found', async () => {
        const response = await request(app)
            .delete('/api/account-routes/account')
            .set('Cookie', [`x-auth-token=${token}`])

        expect(response.status).toBe(400);
        expect(response.text).toBe('User not found');
    });

    it ('should delete the user', async () => {
        await User.create(mockAuthorizeUser);

        const response = await request(app)
            .delete('/api/account-routes/account')
            .set('Cookie', [`x-auth-token=${token}`])

        expect(response.status).toBe(302);
        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([ expect.stringContaining('x-auth-token=;') ])
        );
        expect(response.headers.location).toBe('/api/sign-up');
    });
});