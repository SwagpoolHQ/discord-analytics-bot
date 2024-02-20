import Member from '../models/members.js';
import saveUser from './saveUser.js'
import discordToMongoId from './idConversion/discordToMongoId.js';

export default async function saveMember( member ) {

    //---------------------------------------------------------------------------------------------------------
    //
    //              GET USER FROM DB (AND CREATE IF REQUIRED)
    //
    //---------------------------------------------------------------------------------------------------------

    const userFromDb = await saveUser(member.user);

    //---------------------------------------------------------------------------------------------------------
    //
    //              GET MEMBER FROM DB (AND CREATE IF REQUIRED)
    //
    //---------------------------------------------------------------------------------------------------------

    // checking if the Member exists
    let memberFromDb = await Member.findOne({user: discordToMongoId(member.user.id), guild: discordToMongoId(member.guild.id)});

    if( !memberFromDb ){
      
      // Convert the string to a Date object
      const joinedAtDate = new Date(member.joinedAt);
      // Get the timestamp (UNIX timestamp) from the Date object
      const joinedAtTimestamp = joinedAtDate.getTime();
      
      console.log(`${member.user.username} joined at ${joinedAtTimestamp}`);
      console.log(`Saving ${member.user.username} Member in DB`)

      const newMember = await new Member({
        joinedAtTimestamp,
        guild: discordToMongoId(member.guild.id),
        user: discordToMongoId(member.user.id),
      })

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