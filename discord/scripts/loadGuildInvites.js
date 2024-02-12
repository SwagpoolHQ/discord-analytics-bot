const { Collection } = require('discord.js');

const saveGuildInvites = require('../../mongodb/utils/saveGuildInvites');

//---------------------------------------------------------------//
//
// 				Booting scripts called by loadInvites.js
//
//---------------------------------------------------------------//

async function loadGuildInvites(guild) {

      // Fetch Guild Invites
      let firstInvites;
      try {
        firstInvites = await guild.invites.fetch();
      }        
       catch (e) {
        console.error(e);
      }
      
    
      // Set the key as Guild ID, and create a map which has the invite code, and the number of uses
      if(firstInvites){
        guild.client.invites.set(guild.id, new Collection(firstInvites.map((invite) => [invite.code, { uses: invite.uses, maxUses: invite.maxUses , maxAge: invite.maxAge }])));
      } else {
        guild.client.invites.set(guild.id, new Collection());
      }
      
      
      // SAVING guild Invites in DB 
      try { 
        await saveGuildInvites( guild );
      } catch {
        error => console.error('error while updating invites in mongoDB:', error)
      };
    }
    
module.exports = loadGuildInvites;