const { Collection } = require('discord.js');

const saveGuild = require('../../mongodb/utils/saveGuild');
const loadGuildInvites = require('./loadGuildInvites');

//------------------------------------------------------------------------------//
//
// 				Booting scripts called by the "ready" discord event from ready.js
//
//-------------------------------------------------------------------------------//

async function loadInvites(client) {

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
    
  module.exports = loadInvites;