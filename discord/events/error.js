import { Events } from 'discord.js';

export const event = {
	name: Events.Error,
	execute(e) {
		console.error(e);
	},
};