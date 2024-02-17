//const { Events } = require('discord.js');
import { Events } from 'discord.js';
//const Member = require ('../../mongodb/models/members');
import Member from '../../mongodb/models/members.js';

//const discordToMongoId = require('../../mongodb/utils/idConversion/discordToMongoId');
import discordToMongoId from '../../mongodb/utils/idConversion/discordToMongoId.js';
//const saveMessage = require ('../../mongodb/utils/saveMessage');
import saveMessage from '../../mongodb/utils/saveMessage.js';

export const event = {
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