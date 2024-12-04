import { it, describe, beforeAll, afterAll, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import mongoose from 'mongoose';
import connectToDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
import HourType from '../../../models/hourType.js';

beforeAll( async () => await connectToDB() );
afterAll( async () => await mongoose.disconnect() )

describe('POST - add hour type', () => {
    let admin, token, id;

    beforeEach( async () => {
        id = new mongoose.Types.ObjectId().toHexString();
        admin = { _id: new mongoose.Types.ObjectId().toHexString(), role: 'admin' };
        token = jwt.sign(admin, process.env.JWT_PRIVATE_KEY);
    });

    afterEach( async () => await HourType.deleteOne({}) );

    it ('should make an instance of hour type', async () => {
        const response = await request(app)
            .post('/api/admin/hour-type')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ hourTypes: { name: "a", ratePerHour: 1 } });

        expect(response.status).toBe(201);
    });

    it ('should return hour type already exist', async () => {
        await HourType.create({ hourTypes: { name: 'a', ratePerHour: 1 } });

        const response = await request(app)
            .post('/api/admin/hour-type')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ hourTypes: { name: "a", ratePerHour: 1 } });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Hour type already exist.');
    });

    it ('should push new hour type', async () => {
        await HourType.create({ hourTypes: { name: 'a', ratePerHour: 1 } });

        const response = await request(app)
            .post('/api/admin/hour-type')
            .set('Cookie', [`x-auth-token=${token}`])
            .send({ hourTypes: { name: "b", ratePerHour: 1 } });

        const result = JSON.parse(response.text);

        expect(response.status).toBe(200);
        expect(result).toEqual(
            expect.objectContaining({ hourTypes: expect.arrayContaining([
                expect.objectContaining({ name: 'b' })
            ]) })
        );
    });
});