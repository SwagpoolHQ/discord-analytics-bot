const { Events } = require('discord.js');

module.exports = {
	name: Events.Debug,
	execute(e) {
		//console.info(e); // remove from production logs
	},
};