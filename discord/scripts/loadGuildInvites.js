import { Collection } from 'discord.js';
import saveGuildInvites from '../../mongodb/utils/saveGuildInvites.js';
import checkBotPermissions from '../utils/checkBotPermissions.js';
import permissionsRequired from '../config/permissionsRequired.js';

//---------------------------------------------------------------//
//
// 				Booting scripts called by loadInvites.js
//
//---------------------------------------------------------------//

export default async function loadGuildInvites(guild) {

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
        console.error(`error while fetching invites for ${guild.name} from Discord:`, e);
      }
      
    
      // Set the key as Guild ID, and create a map which has the invite code, and the number of uses
      if(firstInvites){
        guild.client.invites
          .set(
            guild.id, 
            new Collection(
              firstInvites.map((invite) => [invite.code, { 
                uses: invite.uses, 
                maxUses: invite.maxUses, 
                maxAge: invite.maxAge,
                _expiresTimestamp: invite._expiresTimestamp,
              }])
            )
          );
      } else {
        guild.client.invites.set(guild.id, new Collection());
      };
      
      
      // SAVING guild Invites in DB 
      try { 
        await saveGuildInvites( guild );
      } catch {
        error => console.error(`error while updating invites for ${guild.name} in mongoDB:`, error)
      };
    };