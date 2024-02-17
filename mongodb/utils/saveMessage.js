//const Message = require ('../models/messages');
import Message from '../models/messages.js';
//const discordToMongoId = require('./idConversion/discordToMongoId');
import discordToMongoId from './idConversion/discordToMongoId.js';

export default async function saveMessage(message) {

  let savedMessage;

  // Convert the string to a Date object
  const createdDate = new Date(message.createdTimestamp);
  // Get the timestamp (UNIX timestamp) from the Date object
  const createdTimestamp = createdDate.getTime();

  const newMessage = new Message({
      _id: discordToMongoId(message.id),
      channelId: message.channelId,
      guild: discordToMongoId(message.guildId),
      discordId: message.id,
      createdTimestamp,
      type: message.type,
      content: message.content,
      author: discordToMongoId(message.author.id),
    })

  try {
      savedMessage = await newMessage.save(); 
  } catch {
    error => {
      console.error('error while saving message in mongoDB:', error)
      }
  }
    
  return savedMessage
};

//module.exports = saveMessage;