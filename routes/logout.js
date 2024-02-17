//const express = require('express');
//const { lucia } = require('../lucia/auth.js');
import express from 'express';
import { lucia } from '../lucia/auth.js';

export const logoutRouter = express.Router();

logoutRouter.post("/", async (_, res) => {
	if (!res.locals.session) {
		return res.status(401).end();
	}
	await lucia.invalidateSession(res.locals.session.id);
	return res
		.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize())
		.redirect("/login");
});

//module.exports = logoutRouter;