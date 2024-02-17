//var express = require('express');
import express from 'express';
//var path = require('path');
import path from 'path';
//var cookieParser = require('cookie-parser');
import cookieParser from 'cookie-parser';
//var logger = require('morgan');
import logger from 'morgan';

//require('dotenv').config();
import dotenv from 'dotenv';
dotenv.config();
//require('./mongodb/connection');
import './mongodb/connection.js';

//const { verifyRequestOrigin } = require('lucia');
import { verifyRequestOrigin } from 'lucia';
//const { lucia } = require('./lucia/auth');
import { lucia } from './lucia/auth.js';

//const mainRouter = require('./routes/index.js');
import { mainRouter } from './routes/index.js';
//const loginRouter = require('./routes/login/index.js');
import { loginRouter } from "./routes/login/index.js";
//const logoutRouter = require('./routes/logout.js');
import { logoutRouter } from "./routes/logout.js";

//const linkRouter = require('./routes/link.js');
import { linkRouter } from './routes/link.js';
//const usersRouter = require('./routes/users.js');
import { usersRouter } from './routes/users.js';
//const populateRouter = require('./routes/populate.js');
import { populateRouter } from './routes/populate.js';

const app = express();

//const cors = require('cors');
import cors from 'cors';
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Added for __dirname creation
/*import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
*/

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

app.use(loginRouter, logoutRouter); // NO ROUTES ?

app.use('/', mainRouter);
app.use('/link', linkRouter);
app.use('/users', usersRouter);
app.use('/populate', populateRouter);

//require('./discord/index');
import './discord/index.js';

//module.exports = app;

export default app;
