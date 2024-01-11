const { Events, Collection } = require('discord.js');

const saveGuild = require('../../mongodb/utils/saveGuild');
const loadGuildInvites = require('../scripts/loadGuildInvites');

module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {
      // Updating the guild in DB  
      const guildFromDb = await saveGuild(guild);
      // Loading guild's invites for matching on MemberCreate 
      loadGuildInvites(guild);
	},
};