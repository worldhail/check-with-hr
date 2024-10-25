export default (input, token) => {
    return {
        verificationToken: token,
        email: input.body.newEmail || input.body.email,
        fromMethod: input.method,
        fromUrl: input.originalUrl
    };
};