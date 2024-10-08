import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the .env.test file for all tests
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });