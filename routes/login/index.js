import express from "express";
import fs from "fs/promises";

//const { discordLoginRouter } = require('./discord.js');
import { discordLoginRouter } from './discord.js';

//const express = require('express');
export const loginRouter = express.Router();
//const fs = require('fs/promises');


loginRouter.use(discordLoginRouter);

loginRouter.get("/login", async (_, res) => {
	if (res.locals.session) {
		return res.redirect("/");
	}
	const htmlFile = await fs.readFile("routes/login/index.html");
	return res.setHeader("Content-Type", "text/html").status(200).send(htmlFile);
});

//module.exports = loginRouter;