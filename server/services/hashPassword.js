import bcrypt from 'bcrypt';

export default async (input) => {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
    return bcrypt.hash(input, salt);
};