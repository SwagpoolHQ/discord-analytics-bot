//const mongodb = require("mongoose");
import mongodb from 'mongoose';

const Message = mongodb.models.Message || mongodb.model("Message",
new mongodb.Schema(
	{
		discordId: {
			type: String,
			required: true
		},
		channelId: {
			type: String,
			required: true
		},
        guild: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Guild',
			required: true
		},
        createdTimestamp: {
			type: Date,
			required: true
		},
        type: {
			type: Number,
			required: true
		},
        content: {
			type: String,
			required: false
		},
        author: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},	
	}
));

//module.exports = Message;
export default Message;