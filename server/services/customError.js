export default class ClientError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    };
};