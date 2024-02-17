//const { Events } = require('discord.js');
import { Events } from 'discord.js';

export const event = {
	name: Events.Debug,
	execute(e) {
		//console.info(e); // remove from production logs
	},
};