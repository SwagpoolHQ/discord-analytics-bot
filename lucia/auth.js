//require('dotenv').config();
import dotenv from 'dotenv';
dotenv.config();

//const { Lucia } = require("lucia");
import { Lucia } from 'lucia';
//const { MongodbAdapter } = require("@lucia-auth/adapter-mongodb");
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
//const mongodb = require("mongoose");

// CONNECTION TO MONGO DB HERE

//const User = require('../mongodb/models/users.js');
import User from '../mongodb/models/users.js';
//const Session =  require('../mongodb/models/sessions.js');
import Session from '../mongodb/models/sessions.js';

//const { webcrypto } = require('node:crypto');
import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

//const { Discord } = require("arctic");
import { Discord } from 'arctic';

const adapter = new MongodbAdapter( Session, User );

console.log('lucia/auth.js is executed');

export const lucia = new Lucia(
    adapter, 
    {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	},
	getUserAttributes: (attributes) => {
		return {
            discordId: attributes.discord_id,
            username: attributes.username,
		};
	}
});

export const discordAuth = new Discord(
    process.env.DISCORD_CLIENT_ID ?? "", 
    process.env.DISCORD_CLIENT_SECRET ?? "",
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/login/discord/callback' // LOCAL DEV discord redirect URI goes here 
      : `${process.env.PROD_URI}/login/discord/callback`, // PROD discord redirect URI goes here
    );

//module.exports = { lucia, discordAuth };

/*declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<DatabaseUser, "id">;
	}
}*/ //TYPESCRIPT