import { Events, Collection } from 'discord.js';
import saveGuild from '../../mongodb/utils/saveGuild.js';
import loadGuildInvites from '../scripts/loadGuildInvites.js';

export const event = {
	name: Events.GuildCreate,
	async execute(guild) {
      // LOADING empty campaigns collection for guild
      guild.client.campaigns.set(guild.id, new Collection());
      // Updating the guild in DB  
      const guildFromDb = await saveGuild(guild);
      // Loading guild's invites for matching on MemberCreate 
      loadGuildInvites(guild);
	},
};