const { Events } = require('discord.js');

module.exports = {
	name: Events.Error,
	execute(e) {
		console.error(e);
	},
};