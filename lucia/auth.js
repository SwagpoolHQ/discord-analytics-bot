import { Lucia } from 'lucia';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
import mongodb from "mongoose";
import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;
import { Discord } from 'arctic';
import baseURL from '../utils/baseURL.js';

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
            discordId: attributes.discordId,
            username: attributes.username,
		};
	}
});

export const discordAuth = new Discord(
    process.env.DISCORD_CLIENT_ID ?? "", 
    process.env.DISCORD_CLIENT_SECRET ?? "",
    `${baseURL}/login/discord/callback`
    );

export const discordAuthForInvite = new Discord(
    process.env.DISCORD_CLIENT_ID ?? "", 
    process.env.DISCORD_CLIENT_SECRET ?? "",
    `${baseURL}/invite/login/discord/callback`
    );


/*declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<DatabaseUser, "id">;
	}
}*/ //TYPESCRIPT