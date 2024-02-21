import express from "express";
import { lucia, discordAuthForInvite } from '../../lucia/auth.js';
import { OAuth2RequestError, generateState } from "arctic";
import { parseCookies, serializeCookie } from "oslo/cookie";
import debug from "../../mongodb/utils/debug.js";

import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;
import User from '../../mongodb/models/users.js';
import saveUser from "../../mongodb/utils/saveUser.js";

import discordToMongoId from '../../mongodb/utils/idConversion/discordToMongoId.js';

//import type { DatabaseUser } from "../../lib/db.js"; TYPESCRIPT

export const discordLoginRouter = express.Router();

discordLoginRouter.get("/login/discord", async (_, res) => {

	const state = generateState();
	const url = await discordAuthForInvite.createAuthorizationURL(
        state,
        {
            scopes: ["identify"] 
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
			}))
		.redirect(url.toString());
});

discordLoginRouter.get("/login/discord/callback", async (req, res) => {

	const code = req.query.code?.toString() ?? null;
	const state = req.query.state?.toString() ?? null;
	const storedState = parseCookies(req.headers.cookie ?? "").get("discord_oauth_state") ?? null;
	const storedInvite = parseCookies(req.headers.cookie ?? "").get("invite_code") ?? null;

	if (!code || !state || !storedState || state !== storedState) {
		debug('%s',code, state, storedState);
		res.status(400).end();
		return;
	}
	try {
		const tokens = await discordAuthForInvite.validateAuthorizationCode(code);
		const discordUserResponse = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const discordUser = await discordUserResponse.json();
		/// CAN FETCH OTHER @me DISCORD API HERE
		
		const existingUser = await User.findOne({ discordId: discordUser.id }); // SWITCH TO findById HERE

		const userId = new ObjectId(discordToMongoId( discordUser.id ));

		if (existingUser) {
			
			const session = await lucia.createSession(userId, {});		
			
			return res
				.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
				.redirect(`/invite/${storedInvite}`);
		}

		await saveUser( discordUser ); /// Add try/catch

		const session = await lucia.createSession(userId, {});
		return res
			.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
			.redirect(`/invite/${storedInvite}`);
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