const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildDelete,
	execute(guild) {
      // We've been removed from a Guild. Let's delete all their invites
      guild.client.invites.delete(guild.id);
	},
};