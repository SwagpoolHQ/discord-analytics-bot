import express from 'express';
//import path from 'path';
//import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import './mongodb/connection.js';
import rateLimiterMiddleware from './middlewares/rateLimiterMiddleware.js';
import corsMiddleware from './middlewares/corsMiddleware.js';
import authMiddleware from './middlewares/authMiddleware.js';

import { mainRouter } from './routes/index.js';
import { loginRouter } from "./routes/login/index.js";
import { logoutRouter } from "./routes/logout.js";
import { inviteRouter } from './routes/invite/index.js';
import { populateRouter } from './routes/populate.js';

const app = express();

import cors from 'cors';
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Added for __dirname creation - REQUIRED FOR PUBLIC FOLDER ACTIVATION
/*
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
*/

// apply rate limiter to all requests
app.use(rateLimiterMiddleware);
// apply cross origin request security check to all requests except GET/
app.use(corsMiddleware);
// apply auth session check & refresh to all requests
app.use(authMiddleware);

app.use('/', mainRouter, loginRouter, logoutRouter);
app.use('/invite', inviteRouter);
app.use('/populate', populateRouter);

import './discord/index.js';

export default app;
