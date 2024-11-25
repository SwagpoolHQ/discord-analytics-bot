import { Events } from 'discord.js';

export const event = {
  name: Events.MessageReactionAdd,
  async execute(messageReaction, user) {

    try {

      // fetch the message if it's not cached
      const message = !messageReaction.message.author
        ? await messageReaction.message.fetch()
        : messageReaction.message;

    } catch (e) {
      console.warn('Error on messageReactionAdd event: ', e);
    }
  },
};