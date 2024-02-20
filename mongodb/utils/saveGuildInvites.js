import Invite from '../models/invites.js';
import discordToMongoId from './idConversion/discordToMongoId.js';
import saveMember from './saveMember.js';

export default async function saveGuildInvites( guild ) {

  // fetching invites in DB for the guild
  let invitesInDb = await Invite.find({ guild: discordToMongoId(guild.id) });

  // Loop over all the cached invites by discordJS for the guild
  guild.invites.cache.forEach(async (invite) => {
    
    // checking if invite already exists in db
    if(!invitesInDb.some(item => item.code == invite.code)){

      console.log(`Saving invite ${invite.code} in DB from saveGuildInvites`)

      //Getting the member from Discord API (and managing "member left" case)
      let creatorMember;
      try {
        creatorMember = await guild.members.fetch(invite.inviterId); 
      } catch {
        error => console.error('error while fetching member on Discord API:', error)
      }

      //Saving the creator (as Member) in DB
      if (creatorMember){
        try {
        await saveMember( creatorMember ); // RM AWAIT
        } catch {
          error => console.error('error while saving user in mongoDB:', error)
        }
      } else {
        console.log(`${invite.code} invite creator is not a member of guild ${guild.name} anymore`)
      }
      


      // create new invite to save in db
      const newInvite = new Invite({
        code: invite.code,
        name: invite.code,
        _expiresTimestamp: invite._expiresTimestamp,
        description: "",
        guild: discordToMongoId(guild.id),
        creator: discordToMongoId(invite.inviterId),
        referrer: discordToMongoId(invite.inviterId), 
        channel: discordToMongoId(invite.channel.id),
      });

      // saving new invite in db
      try {
        await newInvite.save();
      } catch {
        error => {
          console.error('error while updating guild in mongoDB:', error)
        }
      }
    }
  });

  invitesInDb = await Invite.find({ guild: discordToMongoId(guild.id) });

  return invitesInDb;
};