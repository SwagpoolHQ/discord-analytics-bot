//const express = require('express');
import express from "express";
//const { lucia, discordAuth } = require('../lucia/auth.js');
import { lucia, discordAuthForInvite } from '../../lucia/auth.js';
//const { OAuth2RequestError, generateState } = require('arctic');
import { OAuth2RequestError, generateState } from "arctic";
//const { parseCookies, serializeCookie } = require('oslo/cookie');
import { parseCookies, serializeCookie } from "oslo/cookie";
//const { generateId } = require('lucia');
import { generateId } from "lucia";

import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;

//const User = require('../../mongodb/models/users.js');
import User from '../../mongodb/models/users.js';
//const Session =  require('../../mongodb/models/sessions.js');
import Session from '../../mongodb/models/sessions.js';

import discordToMongoId from '../../mongodb/utils/idConversion/discordToMongoId.js';

//import type { DatabaseUser } from "../../lib/db.js"; TYPESCRIPT

export const discordLoginRouter = express.Router();

discordLoginRouter.get("/login/discord", async (_, res) => {
	console.log("inside invite/login/discord");
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
		.appendHeader(
			"Set-Cookie",
			serializeCookie("invite_code", "ALPHA", { // I WANT TO SET THE COOKIE ON THE INDEX.JS PAGE
				path: "/",
				secure: process.env.NODE_ENV === "production",
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: "lax"
			}))
		.redirect(url.toString());
});

discordLoginRouter.get("/login/discord/callback", async (req, res) => {
	console.log("inside invite/login/discord/callback")
	const code = req.query.code?.toString() ?? null;
	const state = req.query.state?.toString() ?? null;
	const storedState = parseCookies(req.headers.cookie ?? "").get("discord_oauth_state") ?? null;
	const storedInvite = parseCookies(req.headers.cookie ?? "").get("invite_code") ?? null;
	console.log('storedInvite:', storedInvite);
	if (!code || !state || !storedState || state !== storedState) {
		console.log(code, state, storedState);
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
		console.log('discordUser: ', discordUser);
		
		const existingUser = await User.findOne({ discordId: discordUser.id }); // SWITCH TO findById HERE
		console.log('existingUser', existingUser)

		//const userId = generateId(15); 
		const userId = new ObjectId(discordToMongoId( discordUser.id ));
		console.log('userId: ', userId)

		if (existingUser) {
			console.log('creating session for: ', userId)
			
			const session = await lucia.createSession(userId, {});		
			
			console.log('session: ', session);
			return res
				.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
				.redirect(`/invite/${storedInvite}`);
		}

		const newUser = new User({
			_id: userId,
			discordId: discordUser.id,
            //createdAtTimestamp: discordToCreatedAtTimestamp(discordUser.id),
            username: discordUser.username,
		})
		console.log('newUser: ', newUser)
		await newUser.save();

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

//module.exports = discordLoginRouter;