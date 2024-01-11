const { Events } = require('discord.js');
const User = require ('../../mongodb/models/users');
const Member = require ('../../mongodb/models/members');

const discordToMongoId = require('../../mongodb/utils/idConversion/discordToMongoId');
const saveMessage = require ('../../mongodb/utils/saveMessage');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {

    // Only save messages when Member is saved in DB
    const memberFromDb = await Member.findOne({ user: discordToMongoId(message.author.id), guild: discordToMongoId(message.guild.id) })
       
    if(memberFromDb){

      const savedMessage = await saveMessage(message);

      // To delete later
      console.log('saved message: ', savedMessage._id)
        
    } else {
        console.log(`Author NOT found in db for message: ${message.content}`)
    }
	},
};