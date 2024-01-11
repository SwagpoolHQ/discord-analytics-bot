const { Events } = require('discord.js');

const saveMemberOnJoin = require('../../mongodb/utils/saveMemberOnJoin');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {

      //---------------------------------------------------------------------------------------------------------
      //
      //              GETTING THE INVITE USED BY THE NEW MEMBER 
      //
      //---------------------------------------------------------------------------------------------------------     

      // To compare, we need to load the current invite list.
      const newInvites = await member.guild.invites.fetch()
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
                  if ( deletedAtTimestamp = oldInvites.get(code).deletedAtTimestamp ){
                        deletedInvites.push({ code , deletedAtTimestamp });
                  }
            };
      } else {
            // If invite not found, checking for a missing (=deleted) invite in newInvites
            for (const code of oldInvites.keys()){
                  // If oldInvite is flagged "deleted", add to deletedInvites array for later
                  if ( deletedAtTimestamp = oldInvites.get(code).deletedAtTimestamp ){
                        deletedInvites.push({ code , deletedAtTimestamp })
                  // If oldInvite is NOT flagged "deleted", check if missing (=deleted) in newInvites
                  } else if ( !newInvites.find(i => i.code == code ) ){
                        codesUsed.push(code);
                  } 
            };

            // If no missing invite in newInvites, selecting the newest deletedInvite based on deletedAtTimestamp
            if ( !codesUsed[0] && deletedInvites[0] ){
                  deletedInvites.sort( (a,b) => b.deletedAtTimestamp - a.deletedAtTimestamp )
                  //console.log('deletedInvites',deletedInvites)
                  codesUsed.push(deletedInvites[0].code);
            };
      }    
      
       // Log if more than one invite found
      if (codesUsed.length < 1){
            console.log(`ERROR - No invite code found for ${member.user.username} in ${member.guild.name}`)
      }

      // Deleting obsolete oldInvites ()
      for (const deletedInvite of deletedInvites){
            oldInvites.delete(deletedInvite.code);
      }

      //---------------------------------------------------------------------------------------------------------
      //
      //              SAVING THE NEW MEMBER IN DB 
      //
      //---------------------------------------------------------------------------------------------------------
 
      const savedMember = await saveMemberOnJoin( member, codesUsed[0] );

      //logChannel.send(`${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`)
    
	},
};