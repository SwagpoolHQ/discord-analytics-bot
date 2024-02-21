import dotenv from 'dotenv';
dotenv.config();

import { Lucia } from 'lucia';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
import mongodb from "mongoose";
import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;
import { Discord } from 'arctic';

const adapter = new MongodbAdapter( 
	mongodb.connection.collection("sessions"), 
	mongodb.connection.collection("users") 
);

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

export const discordAuthForInvite = new Discord(
    process.env.DISCORD_CLIENT_ID ?? "", 
    process.env.DISCORD_CLIENT_SECRET ?? "",
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/invite/login/discord/callback' // LOCAL DEV discord redirect URI goes here 
      : `${process.env.PROD_URI}/invite/login/discord/callback`, // PROD discord redirect URI goes here
    );


/*declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<DatabaseUser, "id">;
	}
}*/ //TYPESCRIPT