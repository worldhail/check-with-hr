import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import request from 'supertest';
import app from '../../../app.js';
import mongoose from "mongoose";
import connectToDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
import User from "../../../models/user.js";
import Payslip from "../../../models/payslip.js";
import HourType from "../../../models/hourType.js";
import createPayslipTemplate from "../../../services/createPayslipTemplate.js";

const id = new mongoose.Types.ObjectId().toHexString();
const adminId = new mongoose.Types.ObjectId().toHexString();
const mockUser = {
    _id: id,
    employeeID: 'employeeID6',
    firstName: 'aa',
    middleName: 'bb',
    lastName: 'cc',
    email: 'email@4.com',
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

describe('POST - generate payslip template', () => {
    let admin, token;

    beforeEach( async () => {
        admin = { _id: adminId, role: 'admin' };
        token = jwt.sign(admin, process.env.JWT_PRIVATE_KEY);
        await User.create(mockUser);
    });

    afterEach( async () => {
        await User.deleteOne({ email: 'email@4.com' });
        await Payslip.deleteOne({ 'Employee.user': id });
        await HourType.deleteOne({});
    });

    it ('should return please add an hour type', async () => {
        const response = await request(app)
            .post(`/api/admin/payslip-template/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])

        expect(response.status).toBe(400);
        expect(response.text).toBe('Please add an hour type');
    });

    it ('should generate a payslip for the user', async () => {
        await HourType.create({ hourTypes: {name: 'a', ratePerHour: 1 } });

        const response = await request(app)
            .post(`/api/admin/payslip-template/${id}`)
            .set('Cookie', [`x-auth-token=${token}`]);

        const result = JSON.parse(response.text);
        const expectedObjects = [ 
            'Employee',
            'Earnings',
            'Contributions & Deductions',
            'Allowances',
            'Hourly Breakdown',
            'Totals',
            'date'
        ]

        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThanOrEqual(201);
        expectedObjects.map(item => expect(result).toHaveProperty(item));
    });
});

describe('PUT - update earnings', () => {
    let admin, token;

    beforeEach( async () => {
        admin = { _id: adminId, role: 'admin' };
        token = jwt.sign(admin, process.env.JWT_PRIVATE_KEY);
        await User.create(mockUser);
    });

    afterEach( async () => {
        await User.deleteOne({ email: 'email@4.com' });
        await Payslip.deleteOne({ 'Employee.user': id });
        await HourType.deleteOne({});
    });

    it ('should return payslip not found for the user', async () => {
        const response = await request(app)
            .put(`/api/admin/payslip/earnings/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ Earnings: { 'Performance Bonus / Attendance bonus': 1 }});
        
        expect(response.status).toBe(404);
        expect(response.text).toBe('Payslip not found for the user');
    });

    it ('should update the payslip earnings', async () => {
        await HourType.create({ hourTypes: { name: 'a', ratePerHour: 1 }});
        await createPayslipTemplate(id);

        const response = await request(app)
            .put(`/api/admin/payslip/earnings/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ Earnings: { 'Performance Bonus / Attendance bonus': 1 }});
        
        const result = JSON.parse(response.text);

        expect(response.status).toBe(200);
        expect(result.acknowledged).toBeTruthy();
    });
});

describe('PUT - update contributions and deductions', () => {
    let admin, token;

    beforeEach( async () => {
        admin = { _id: adminId, role: 'admin' };
        token = jwt.sign(admin, process.env.JWT_PRIVATE_KEY);
        await User.create(mockUser);
    });

    afterEach( async () => {
        await User.deleteOne({ email: 'email@4.com' });
        await Payslip.deleteOne({ 'Employee.user': id });
        await HourType.deleteOne({});
    });

    it ('should return payslip not found for the user', async () => {
        const response = await request(app)
            .put(`/api/admin/payslip/contributions-and-deductions/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ 'Contributions & Deductions': { 'SSS': 1, 'Other Deductions': 1} });
        
        expect(response.status).toBe(404);
        expect(response.text).toBe('Payslip not found for the user');
    });

    it ('should update the payslip contributions and deductions', async () => {
        await HourType.create({ hourTypes: { name: 'a', ratePerHour: 1 }});
        await createPayslipTemplate(id);

        const response = await request(app)
            .put(`/api/admin/payslip/contributions-and-deductions/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ 'Contributions & Deductions': { 'SSS': 1, 'Other Deductions': 1 } });
        
        const result = JSON.parse(response.text);

        expect(response.status).toBe(200);
        expect(result.acknowledged).toBeTruthy();
    });
});

describe('PUT - update allowances', () => {
    let admin, token;

    beforeEach( async () => {
        admin = { _id: adminId, role: 'admin' };
        token = jwt.sign(admin, process.env.JWT_PRIVATE_KEY);
        await User.create(mockUser);
    });

    afterEach( async () => {
        await User.deleteOne({ email: 'email@4.com' });
        await Payslip.deleteOne({ 'Employee.user': id });
        await HourType.deleteOne({});
    });

    it ('should return payslip not found for the user', async () => {
        const response = await request(app)
            .put(`/api/admin/payslip/allowances/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                "Allowances": {
                    "Rice Allowance": 750,
                    "Laundry Allowance": 150,
                }
            });
        
        expect(response.status).toBe(404);
        expect(response.text).toBe('Payslip not found for the user');
    });

    it ('should update the payslip allowances', async () => {
        await HourType.create({ hourTypes: { name: 'a', ratePerHour: 1 }});
        await createPayslipTemplate(id);

        const response = await request(app)
            .put(`/api/admin/payslip/allowances/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                "Allowances": {
                    "Rice Allowance": 750,
                    "Laundry Allowance": 150,
                }
            });
        
        const result = JSON.parse(response.text);

        expect(response.status).toBe(200);
        expect(result.acknowledged).toBeTruthy();
    });
});

describe('PUT - update hourly breakdown', () => {
    let admin, token;

    beforeEach( async () => {
        admin = { _id: adminId, role: 'admin' };
        token = jwt.sign(admin, process.env.JWT_PRIVATE_KEY);
        await User.create(mockUser);
    });

    afterEach( async () => {
        await User.deleteOne({ email: 'email@4.com' });
        await Payslip.deleteOne({ 'Employee.user': id });
        await HourType.deleteOne({});
    });

    it ('should return payslip not found for the user', async () => {
        const response = await request(app)
            .put(`/api/admin/payslip/hourly-breakdown/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                "Hourly Breakdown": {
                    "breakdown": [
                        {
                            "Hour Type": "Regular Hours",
                            "Hours": 8
                        }
                    ]
                }
            });
        
        expect(response.status).toBe(404);
        expect(response.text).toBe('Payslip not found for the user');
    });

    it ('should return hour types do not exist', async () => {
        await HourType.create({ hourTypes: { name: 'a', ratePerHour: 1 }});
        await createPayslipTemplate(id);

        const response = await request(app)
            .put(`/api/admin/payslip/hourly-breakdown/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                "Hourly Breakdown": {
                    "breakdown": [
                        {
                            "Hour Type": 'b',
                            "Hours": 8
                        }
                    ]
                }
            });

        const responseText = response.text.includes('The below hour type/s does/do not exist');

        expect(response.status).toBe(400);
        expect(responseText).toBeTruthy();
    });

    it ('should update the hourly breakdown', async () => {
        await HourType.create({ hourTypes: { name: 'a', ratePerHour: 1 }});
        await createPayslipTemplate(id);

        const response = await request(app)
            .put(`/api/admin/payslip/hourly-breakdown/${id}`)
            .set('Cookie', [`x-auth-token=${token}`])
            .send({
                "Hourly Breakdown": {
                    "breakdown": [
                        {
                            "Hour Type": 'a',
                            "Hours": 8
                        }
                    ]
                }
            });

        const result = JSON.parse(`${response.text}`);
        
        expect(response.status).toBe(200);
        expect(result.acknowledged).toBeTruthy();
    });
});