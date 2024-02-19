//const { Events } = require('discord.js');
import { Events } from 'discord.js';

export const event = {
	name: Events.GuildDelete,
	execute(guild) {
      // We've been removed from a Guild. Let's delete all their invites
      guild.client.invites.delete(guild.id);
	  // UNLOAD joiners collection for guild
      guild.client.joiners.delete(guild.id);
	},
};