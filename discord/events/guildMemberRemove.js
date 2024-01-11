const { Events } = require('discord.js');
const Member = require('../../mongodb/models/members');

const discordToMongoId = require('../../mongodb/utils/idConversion/discordToMongoId');

module.exports = {
	name: Events.GuildMemberRemove,
	async execute(member) {

        const memberFromDb = await Member.findOne({ guild: discordToMongoId(member.guild.id), user: discordToMongoId(member.user.id) })
        if (memberFromDb){
  
          // Creating leftAt timestamp
          const leftAtDate = new Date();
  
          // Get the timestamp (UNIX timestamp) from the Date object
          const leftAtTimestamp = leftAtDate.getTime();
  
          try {
            await Member.findByIdAndUpdate( memberFromDb._id, {leftAtTimestamp} )
          } catch {
            error => {
            console.error('error while updating existing Member with leftAtTimestamp in mongoDB:', error)
            }
          }
        }
  
        console.log(`${member.user.username} left ${member.guild.name}`)
	},
};