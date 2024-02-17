//const { Events } = require('discord.js');
import { Events } from 'discord.js';

export const event = {
	name: Events.Warn,
	execute(e) {
		console.warn(e);
	},
};