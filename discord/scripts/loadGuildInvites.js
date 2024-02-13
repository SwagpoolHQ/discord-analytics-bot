const { Collection } = require('discord.js');

const saveGuildInvites = require('../../mongodb/utils/saveGuildInvites');
const checkBotPermissions = require('../utils/checkBotPermissions');
const permissionsRequired = require('../config/permissionsRequired');

//---------------------------------------------------------------//
//
// 				Booting scripts called by loadInvites.js
//
//---------------------------------------------------------------//

async function loadGuildInvites(guild) {

      const permissionsCheck = checkBotPermissions( guild, permissionsRequired.inviteTracker);
      if( !permissionsCheck.result) {
        guild.client.invites.set(guild.id, new Collection());
        throw new Error(`${guild.name} is missing permissions: ${permissionsCheck.missing}`);
      };

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
      };
      
      
      // SAVING guild Invites in DB 
      try { 
        await saveGuildInvites( guild );
      } catch {
        error => console.error('error while updating invites in mongoDB:', error)
      };
    }
    
module.exports = loadGuildInvites;