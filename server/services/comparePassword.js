import bcrypt from 'bcrypt';

export default (input, user) => bcrypt.compare(input, user);