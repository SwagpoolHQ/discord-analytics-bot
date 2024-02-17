import express from "express";
import fs from "fs/promises";

export const mainRouter = express.Router();

mainRouter.get("/", async (_, res) => {
	
	if (!res.locals.user) {
		console.log("redirecting to /login");
		return res.redirect("/login");
	}
	console.log(res.locals.user);
	const templateFile = await fs.readFile("routes/index.template.html");
	let template = templateFile.toString("utf-8");
	template = template.replaceAll("%username%", res.locals.user.username);
	template = template.replaceAll("%user_id%", res.locals.user.id);
	return res.setHeader("Content-Type", "text/html").status(200).send(template);
});

//module.exports = mainRouter;