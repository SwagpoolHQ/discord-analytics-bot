import { Collection } from 'discord.js';
import saveGuild from '../../mongodb/utils/saveGuild.js';
import loadGuildInvites from './loadGuildInvites.js';

//------------------------------------------------------------------------------//
//
// 				Booting scripts called by the "ready" discord event from ready.js
//
//-------------------------------------------------------------------------------//

export default async function loadInvites(client) {

    // KEEP OUT OF THE LOOP ON GUILDS - the invites, joiners, and campaigns collection are for all guilds
    client.invites = new Collection();
    client.campaigns = new Collection();
        
    // Loop over all the guilds
    client.guilds.cache.forEach(async (guild) => {
    
      console.log(`Loading guild ${guild.name} with id ${guild.id}`)

      // LOADING empty campaigns collection for guild
      client.campaigns.set(guild.id, new Collection());
    
      // SAVING the guild in DB 
      const guildFromDb = await saveGuild(guild)


      // LOADING all invite from guild
      try{
        await loadGuildInvites(guild);
      } 
      catch(e) {
        console.error(e)
      };
      
    });
    
  };