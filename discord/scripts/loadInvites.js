//const { Collection } = require('discord.js');
import { Collection } from 'discord.js';

//const saveGuild = require('../../mongodb/utils/saveGuild');
import saveGuild from '../../mongodb/utils/saveGuild.js';
//const loadGuildInvites = require('./loadGuildInvites');$
import loadGuildInvites from './loadGuildInvites.js';

//------------------------------------------------------------------------------//
//
// 				Booting scripts called by the "ready" discord event from ready.js
//
//-------------------------------------------------------------------------------//

export default async function loadInvites(client) {

    // KEEP OUT OF THE LOOP ON GUILDS - the invites collection is for all guilds
    client.invites = new Collection();
        
    // Loop over all the guilds
    client.guilds.cache.forEach(async (guild) => {
    
      console.log(`Loading guild ${guild.name} with id ${guild.id}`)
    
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
    
  }
    
  //module.exports = loadInvites;