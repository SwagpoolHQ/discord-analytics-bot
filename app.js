import express from 'express';
//import path from 'path';
//import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import dotenv from 'dotenv';
dotenv.config();

import './mongodb/connection.js';

import { verifyRequestOrigin } from 'lucia';
import { lucia } from './lucia/auth.js';

import { mainRouter } from './routes/index.js';
import { loginRouter } from "./routes/login/index.js";
import { logoutRouter } from "./routes/logout.js";
import { inviteRouter } from './routes/invite/index.js';
import { usersRouter } from './routes/users.js';
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

//1st middleware
app.use((req, res, next) => {
	if (req.method === "GET") {
		console.log('inside 1st middleware GET test')
		return next();
	}
	const originHeader = req.headers.origin ?? null;
	const hostHeader = req.headers.host ?? null;
	if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
		return res.status(403).end();
	}
	return next();
});

//2nd middleware
app.use(async (req, res, next) => {
	console.log('inside 2nd middleware')
	const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
	console.log('sessionId = ',sessionId);
	if (!sessionId) {
		res.locals.user = null;
		res.locals.session = null;
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
	
	console.log('after validateSession session:', session)
	console.log('after validateSession user:', user)

	if (session && session.fresh) {
		res.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
	}
	if (!session) {
		res.appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
	}
	res.locals.session = session;
	res.locals.user = user;
	return next();
});

app.use('/', mainRouter, loginRouter, logoutRouter);
app.use('/invite', inviteRouter);
app.use('/users', usersRouter);
app.use('/populate', populateRouter);

import './discord/index.js';

export default app;
