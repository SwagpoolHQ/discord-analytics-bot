const { Collection } = require('discord.js');

const saveGuildInvites = require('../../mongodb/utils/saveGuildInvites');

//---------------------------------------------------------------//
//
// 				Booting scripts called by loadInvites.js
//
//---------------------------------------------------------------//

async function loadGuildInvites(guild) {

      // Fetch Guild Invites
      const firstInvites = await guild.invites.fetch();
    
      // Set the key as Guild ID, and create a map which has the invite code, and the number of uses
      guild.client.invites.set(guild.id, new Collection(firstInvites.map((invite) => [invite.code, { uses: invite.uses, maxUses: invite.maxUses , maxAge: invite.maxAge }])));
      
      // SAVING guild Invites in DB 
      try { 
        await saveGuildInvites( guild );
      } catch {
        error => console.error('error while updating invites in mongoDB:', error)
      };
    }
    
module.exports = loadGuildInvites;