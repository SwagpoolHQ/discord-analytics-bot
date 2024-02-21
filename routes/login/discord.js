import express from "express";
import { lucia, discordAuth } from '../../lucia/auth.js';
import { OAuth2RequestError, generateState } from "arctic";
import { parseCookies, serializeCookie } from "oslo/cookie";
import debug from "../../mongodb/utils/debug.js";

import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;
import User from '../../mongodb/models/users.js';
import discordToMongoId from '../../mongodb/utils/idConversion/discordToMongoId.js';

//import type { DatabaseUser } from "../../lib/db.js"; TYPESCRIPT

export const discordLoginRouter = express.Router();

discordLoginRouter.get("/login/discord", async (_, res) => {
	const state = generateState();
	const url = await discordAuth.createAuthorizationURL(
        state,
        {
            scopes: ["identify","email","guilds","connections",] 
        }
    );
	res
		.appendHeader(
			"Set-Cookie",
			serializeCookie("discord_oauth_state", state, {
				path: "/",
				secure: process.env.NODE_ENV === "production",
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: "lax"
			})
		)
		.redirect(url.toString());
});

discordLoginRouter.get("/login/discord/callback", async (req, res) => {
	const code = req.query.code?.toString() ?? null;
	const state = req.query.state?.toString() ?? null;
	const storedState = parseCookies(req.headers.cookie ?? "").get("discord_oauth_state") ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		debug('%s',code, state, storedState);
		res.status(400).end();
		return;
	}
	try {
		const tokens = await discordAuth.validateAuthorizationCode(code);
		const discordUserResponse = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const discordUser = await discordUserResponse.json();
		/// CAN FETCH OTHER @me DISCORD API HERE
		debug('discordUser: ', discordUser);
		
		const existingUser = await User.findOne({ discordId: discordUser.id }); // SWITCH TO findById HERE
		debug('existingUser', existingUser);

		//const userId = generateId(15); 
		const userId = new ObjectId(discordToMongoId( discordUser.id ));
		debug('userId: ', userId);

		if (existingUser) {
			debug('creating session for: ', userId);
			
			const session = await lucia.createSession(userId, {});		
			
			debug('session: ', session);
			return res
				.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
				.redirect("/");
		}

		const newUser = new User({
			_id: userId,
			discordId: discordUser.id,
            //createdAtTimestamp: discordToCreatedAtTimestamp(discordUser.id),
            username: discordUser.username,
		})
		debug('newUser: ', newUser)
		await newUser.save();

		const session = await lucia.createSession(userId, {});
		return res
			.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
			.redirect("/");
	} catch (e) {
		if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
			// invalid code
			res.status(400).end();
			return;
		}
		res.status(500).end();
		return;
	}
});