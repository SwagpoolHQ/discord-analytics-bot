const { Events, ActivityType } = require('discord.js');
const loadInvites = require('../scripts/loadInvites')

// name defines for which event the file is for
// once defines whether the function should be run once or everytime.

// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(readyClient) {
		// WARNING "ready" isn't really ready. We need to wait a spell. setTimout(1000) could be required!!
		console.log('Discord client is ready since ',readyClient.readyTimestamp)

		console.log(`Discord client is logged in as ${readyClient.user.tag}`);
		readyClient.user.setActivity(`11 329 servers`, { type: ActivityType.Listening });
    	console.log(`Ready to serve on ${readyClient.guilds.cache.size} servers, for ${readyClient.users.cache.size} users.`);

		//Load the invites on server boot (as soon as discord client is ready)
		loadInvites(readyClient)
	},
};