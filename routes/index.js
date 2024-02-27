import express from "express";
import fs from "fs/promises";
import ga from '../analytics/ga.js'

export const mainRouter = express.Router();

mainRouter.get("/", async (_, res) => {
	
	if (!res.locals.user) {
		return res.redirect("/login");
	}

	const templateFile = await fs.readFile("routes/index.template.html");
	let template = templateFile.toString("utf-8");
	template = template.replaceAll("%username%", res.locals.user.username);
	template = template.replaceAll("%user_id%", res.locals.user.id);
	return res.setHeader("Content-Type", "text/html").status(200).send(template);
});

mainRouter.get("/analytics", async (req, res, next) => {

	// A queue to batch our events
	const events = [];

	// Let's push some events 
	events.push({
		name: 'page_view',
		params: {
			page_location: "https://discordlinks.com/ZZZ", // WARNING => GA might process the IP address from the backend server for view map
        	page_title: "Campaign_ZZZ",
			//user_engagement: "1",
			engagement_time_msec: "1" // Needed for non-zero user count
		},
	});
	/*
	events.push({
		name: 'button_click',
		params: {
			action: 'join_server'
		},
	});

	events.push({
		name: 'unlock_achievement',
		params: {
			achievement_id: 'randomId'
		},
	});
	*/


	const debug = await ga ( 'G-2RSPNCH2FD', process.env.GA_SECRET_KEY , events, false )

	res.json({
		result: true,
		container: 'G-2RSPNCH2FD',
		events,
		debug,
	})

});