const { Events } = require('discord.js');

module.exports = {
	name: Events.Warn,
	execute(e) {
		console.warn(e);
	},
};