// NPM PACKAGES
import dotenv from 'dotenv';
import path, { join } from 'path';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
dotenv.config({ path: join(__dirname, `../.env.${process.env.NODE_ENV}`) });
import express from 'express';
const app = express();
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import connectToDB from './config/db.js';

// CUSTOM MODULES/MIDDLEWARES
import morganDebug from './config/morganDebug.js';
import logInfoWithMorgan from './middleware/logInfoWithMorgan.js';
import routes from './routes/index.js';
import error from './middleware/error.js';

if (process.env.NODE_ENV === 'development') app.use(morganDebug);
app.use(logInfoWithMorgan);
connectToDB();
app.use(helmet());
app.use(session({
    secret: process.env.JWT_PRIVATE_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(routes);
app.use(error);

export default app;