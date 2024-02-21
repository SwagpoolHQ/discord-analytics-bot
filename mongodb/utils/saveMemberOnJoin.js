import Member from '../models/members.js';
import Invite from '../models/invites.js';
import saveUser from './saveUser.js';
import saveGuild from './saveGuild.js';
import discordToMongoId from './idConversion/discordToMongoId.js';
import debug from '../../utils/debug.js';

export default async function saveMemberOnJoin(member, codeUsed) {

    //---------------------------------------------------------------------------------------------------------
    //
    //              GET USER FROM DB (AND CREATE IF REQUIRED)
    //
    //---------------------------------------------------------------------------------------------------------

    const userFromDb = await saveUser(member.user); // RM AWAIT

    //---------------------------------------------------------------------------------------------------------
    //
    //              GET GUILD FROM DB (AND CREATE IF REQUIRED)
    //
    //---------------------------------------------------------------------------------------------------------

    const guildFromDb = await saveGuild(member.guild) // RM AWAIT

    //---------------------------------------------------------------------------------------------------------
    //
    //              GET MEMBER FROM DB (AND CREATE IF REQUIRED)
    //
    //---------------------------------------------------------------------------------------------------------

    let memberFromDb = await Member.findOne({user: discordToMongoId(member.user.id), guild: discordToMongoId(member.guild.id)});
    
    //console.log(`member ${member.user.username} joined with invite ${codeUsed ? codeUsed : null}`);

    if( memberFromDb ){

      if(memberFromDb.leftAtTimestamp){
        debug(`removing leftAtTimestamp from ${member.user.username} Member`)
        try {
          await Member.findByIdAndUpdate( memberFromDb._id, {leftAtTimestamp: null} )
          memberFromDb = await Member.findOne({user: discordToMongoId(member.user.id), guild: discordToMongoId(member.guild.id)});
        } catch {
          error => {
          console.error('error while updating existing Member with existing leftAtTimestamp in mongoDB:', error)
          }
        }
      }
    } else if( memberFromDb ){ // LINK TO INVITE

      debug('Member already exists')

      if(memberFromDb.leftAtTimestamp){
        console.log(`removing leftAtTimestamp from ${member.user.username} Member`)
        try {
          await Member.findByIdAndUpdate( memberFromDb._id, {leftAtTimestamp: null} )
          memberFromDb = await Member.findOne({user: discordToMongoId(member.user.id), guild: discordToMongoId(member.guild.id)});
        } catch {
          error => {
          console.error('error while updating existing Member with existing leftAtTimestamp in mongoDB:', error)
          }
        }
      }
    } else {

      // Convert the string to a Date object
      const joinedAtDate = new Date(member.joinedAt);
      // Get the timestamp (UNIX timestamp) from the Date object
      const joinedAtTimestamp = joinedAtDate.getTime();

      debug(`saveMemberOnJoin: ${member.user.username} joined at ${joinedAtTimestamp}`);

      //---------------------------------------------------------------------------------------------------------
      //
      //              GET INVITE FROM DB (AND CREATE IF REQUIRED)
      //
      //---------------------------------------------------------------------------------------------------------

      let inviteIdFromDb = null;
      
      // checking if the invite used to join was found
      if(codeUsed){ 
        const inviteFromDb = await Invite.findOne({code: codeUsed});
        if (inviteFromDb) {
          inviteIdFromDb = inviteFromDb._id;
        }
      }
          
      console.log(`Saving Member ${member.user.username} with invite ${inviteIdFromDb} in DB`)

      const newMember = await new Member({
        joinedAtTimestamp,
        guild: discordToMongoId(member.guild.id),
        user: discordToMongoId(member.user.id),
        invite: inviteIdFromDb,
      });

      try {
        memberFromDb = await newMember.save();
      } catch {
        error => {
        console.error(`error while saving Member ${member.user.username} in mongoDB:`, error)
        }
      }
    }

    return memberFromDb;
};