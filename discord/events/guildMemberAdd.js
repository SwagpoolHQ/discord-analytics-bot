import { Events } from 'discord.js';
import cleanCampaignsCache from '../utils/cleanCampaignsCache.js'
import saveMemberOnJoin from '../../mongodb/utils/saveMemberOnJoin.js';
import gaGuildMemberJoin from '../../analytics/gaGuildMemberJoin.js'

export const event = {
	name: Events.GuildMemberAdd,
	async execute(member) {

      //---------------------------------------------------------------------------------------------------------
      //
      //              GETTING THE INVITE USED BY THE NEW MEMBER 
      //
      //---------------------------------------------------------------------------------------------------------     

      // CHECK BOT PERMISSIONS HERE


      // To compare, we need to load the current invite list.
      const newInvites = await member.guild.invites.fetch() // ADD TRY CATCH
      // This is the *existing* invites for the guild.
      const oldInvites = member.client.invites.get(member.guild.id);
      // Look through the invites, find the one for which the uses went up.
      const inviteUsed = newInvites.find(i => i.uses > oldInvites.get(i.code)?.uses); // <-- InvitedUsed should be managed with a filter to get an Array and manage the case of multiple matches
      
      const codesUsed = [];
      const deletedInvites = [];

      if (inviteUsed) {
            codesUsed.push(inviteUsed.code);

            // Update cache on new invites
            oldInvites.set(inviteUsed.code, { uses: inviteUsed.uses, maxUses: inviteUsed.maxUses , maxAge: inviteUsed.maxAge });

            // If oldInvite is flagged "deleted", add to deletedInvites array for hard deletion
            for (const code of oldInvites.keys()){
                  const deletedAtTimestamp = oldInvites.get(code).deletedAtTimestamp;
                  if ( deletedAtTimestamp ){
                        deletedInvites.push({ code , deletedAtTimestamp });
                  }
            };
      } else {
            // If invite not found, checking for a missing (=deleted) invite in newInvites
            for (const code of oldInvites.keys()){
                  // Differences between old and new invites list is caused by:
                  // Manually deleted invites. They are flagged in cache through the event "inviteDelete" => SKIP AND REMOVE FROM CACHE
                  // Automatically deleted invites. They don't generate an "inviteDelete" event.
                  // They have either : 
                  // => Reached last number of use : it's been used, it's an invite we're looking for! => SAVE
                  // => Reached expire timestamp : it's NOT an invite I'm looking for. => SKIP AND REMOVE FROM CACHE

                  const deletedAtTimestamp = oldInvites.get(code).deletedAtTimestamp;
                  const _expiresTimestamp = oldInvites.get(code)._expiresTimestamp;
                  const now = (new Date()).getTime() ;

                  if ( deletedAtTimestamp ){ // NOT THIS ONE. Missing from newInvites because invite has been manually deleted
                        deletedInvites.push({ code , deletedAtTimestamp }) // => SKIP AND PREPARED TO BE REMOVED FROM CACHE
                  } else if ( _expiresTimestamp < now ){ // NOT THIS ONE. Missing from newInvites because invite has expired and been automatically deleted
                        deletedInvites.push({ code , deletedAtTimestamp: _expiresTimestamp, expired: true }) // => SKIP AND PREPARED TO BE REMOVED FROM CACHE
                  } else if ( !newInvites.find(i => i.code == code ) ){ // CAN BE ANY OF THESE ONE. Missing from newInvites because (most probable) invite has reached last use and been automatically deleted
                        codesUsed.push(code); 
                  }
            };

            // If no invite from newInvites is missing for "last use" and no invite from newInvite has a number of "use" increase.
            // A. It could be : invite used is new and NOT saved in oldInviteUsed 
            // => oldInvites is loaded on server boot
            // => old invites is updated on "inviteCreate" event
            // Option.1: new invite used before being saved in cache... low probability.
            // Option.2: error when maintaining the cache updated ... this should be monitored with error management.
            // B. It could also be : invite used was deleted either manually or automatically because expired
            // Option.1: if manually deleted, user used the invite just before manual deletion and 'memberAdd' event is processed before "inviteDelete" event.
            // => invite is considered: Automatically deleted from "last use" reached. it's then part of the codeUsed list
            // Option.2: if expired and automatically deleted, user used the invite just before expiration and as 'memberAdd' event is processed, 'now' is after _expiresTimestamp. 
            // => Most probable option : invite used is among the expired invites.
            // => Let's look for the newest expired invite.

            if ( !codesUsed[0] && deletedInvites[0] ){
                  deletedInvites.sort( (a,b) => b.deletedAtTimestamp - a.deletedAtTimestamp )
                  const expiredInvites = deletedInvites.filter( item => item.expired );
                  if ( expiredInvites[0] ){
                        codesUsed.push(expiredInvites[0].code);
                  } else {
                        codesUsed.push(deletedInvites[0].code); // NOT SURE THIS MAKE SENS
                  }
            };
      }    
      
       // Log if more than one invite found
      if (codesUsed.length < 1){
            console.log(`ERROR - No invite code found for ${member.user.username} in ${member.guild.name}`)
      }

      // Deleting obsolete invites from client.invites cache
      for (const deletedInvite of deletedInvites){
            oldInvites.delete(deletedInvite.code); 
      }

      // Deleting obsolete invites from client.campaign cache
      try {
            cleanCampaignsCache( member.guild );
      } catch (e) {
            console.log(`error while clean client.campaigns cache for ${member.guild.id}`, e);
      }

      //---------------------------------------------------------------------------------------------------------
      //
      //              CHECKING FOR forJoiner FIELD (Authenticated scenario) 
      //
      //---------------------------------------------------------------------------------------------------------

      // We deducted the invite code used is "codesUsed[0]"
      // in the scenario were the user is authenticated, the invites (many!) created have a forJoiner field.
      // the invites forJoiner are single use => they will be missing from newInvites if used.


      //---------------------------------------------------------------------------------------------------------
      //
      //              FIRING A GUILD_MEMBER_JOIN GOOGLE ANALYTICS EVENT 
      //
      //---------------------------------------------------------------------------------------------------------

      gaGuildMemberJoin( member, codesUsed[0] );

      //---------------------------------------------------------------------------------------------------------
      //
      //              SAVING THE NEW MEMBER IN DB 
      //
      //---------------------------------------------------------------------------------------------------------
 
      const savedMember = await saveMemberOnJoin( member, codesUsed[0] );

      //logChannel.send(`${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`)
    
	},
};