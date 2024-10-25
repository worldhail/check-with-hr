import { describe, beforeEach, afterEach, it, vi, expect } from 'vitest';
import auth from '../../../middleware/auth';
import jwt from 'jsonwebtoken';

describe('Token authentication', () => {
    let req, res, next;

    beforeEach(() => {
        req = { cookies: {} };
        res = { status: vi.fn().mockReturnThis(), send: vi.fn() };
        next = vi.fn();
    });

    afterEach(() => { vi.clearAllMocks(); });

    it('should return 401 if no token is provided', () => {
        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Access denied. Something is wrong.');
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if token provided is invalid', () => {
        req.cookies['x-auth-token'] = 'x';

        vi.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error(); });

        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid token!');
    });

    it('should call next when token is valid', () => {
        req.cookies['x-auth-token'] = 'valid'
        const payload = { _id: 1, role: 'employee' }

        vi.spyOn(jwt, 'verify').mockImplementation(() => req.user = payload);

        auth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid', process.env.JWT_PRIVATE_KEY);
        expect(req.user).toEqual(payload);
        expect(next).toHaveBeenCalled();
    });
});