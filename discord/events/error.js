//const { Events } = require('discord.js');
import { Events } from 'discord.js';

export const event = {
	name: Events.Error,
	execute(e) {
		console.error(e);
	},
};