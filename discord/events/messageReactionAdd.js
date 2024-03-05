import { Events } from 'discord.js';
import gaMessageReactionAdd from '../../analytics/gaMessageReactionAdd.js'
import Member from '../../mongodb/models/members.js';
import discordToMongoId from '../../mongodb/utils/idConversion/discordToMongoId.js';
import saveMessage from '../../mongodb/utils/saveMessage.js';
import ga from '../../analytics/ga.js';
import gaMessageSent from '../../analytics/gaMessageSent.js'

export const event = {
	name: Events.MessageReactionAdd,
	async execute( messageReaction	, user ) {

    try {

      // fetch the message if it's not cached
      const message = !messageReaction.message.author
      ? await messageReaction.message.fetch()
      : messageReaction.message;

      // Sending a message_sent event to Google Analytics
      gaMessageReactionAdd( messageReaction, user );

      console.log( 'messageReaction', messageReaction );
      console.log( 'user', user)

    } catch (e) {
      console.warn('Error on messageReactionAdd event: ', e);
    }
	},
};