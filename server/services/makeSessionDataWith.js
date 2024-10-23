export default (input, token) => {
    return {
        verificationToken: token,
        email: input.body.newEmail,
        fromMethod: input.method,
        fromUrl: input.originalUrl
    };
};