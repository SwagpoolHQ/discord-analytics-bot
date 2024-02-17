//const { Events, Collection } = require('discord.js');
import { Events, Collection } from 'discord.js';

//const saveGuild = require('../../mongodb/utils/saveGuild');
import saveGuild from '../../mongodb/utils/saveGuild.js';
//const loadGuildInvites = require('../scripts/loadGuildInvites');
import loadGuildInvites from '../scripts/loadGuildInvites.js';

export const event = {
	name: Events.GuildCreate,
	async execute(guild) {
      // Updating the guild in DB  
      const guildFromDb = await saveGuild(guild);
      // Loading guild's invites for matching on MemberCreate 
      loadGuildInvites(guild);
	},
};