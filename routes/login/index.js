import express from "express";
import fs from "fs/promises";
import { discordLoginRouter } from './discord.js';

export const loginRouter = express.Router();

loginRouter.use(discordLoginRouter);

loginRouter.get("/login", async (_, res) => {
	if (res.locals.session) {
		return res.redirect("/");
	}
	const htmlFile = await fs.readFile("routes/login/index.html");
	return res.setHeader("Content-Type", "text/html").status(200).send(htmlFile);
});