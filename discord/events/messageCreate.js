import { Events } from 'discord.js';
import Member from '../../mongodb/models/members.js';
import discordToMongoId from '../../mongodb/utils/idConversion/discordToMongoId.js';
import saveMessage from '../../mongodb/utils/saveMessage.js';
import ga from '../../analytics/ga.js';
import gaMessageSent from '../../analytics/gaMessageSent.js'

export const event = {
	name: Events.MessageCreate,
	async execute(message) {
    try {

      if (message.partial) { await message.fetch() }; // Make sure the message is fully loaded

      // Sending a message_sent event to Google Analytics
      gaMessageSent( message );

      // Only save messages when Member is saved in DB
      const memberFromDb = await Member.findOne({ user: discordToMongoId(message.author.id), guild: discordToMongoId(message.guild.id) })
        
      if(memberFromDb){

        const savedMessage = await saveMessage(message);

        // To delete later
        console.log('saved message: ', savedMessage._id)
          
      } else {
          console.log(`Author NOT found in db for message: ${message.content}`)
      }
    } catch (e) {
      console.warn('Error on messageCreate event: ', e);
    }
	},
};