const mongodb = require("mongoose");

const Invite = mongodb.models.Invite || mongodb.model("Invite",
new mongodb.Schema(
	{
        discordId: {
			type: String,
			required: false
		},
		code: {
			type: String,
			required: true
		},
		name: {
			type: String,
			required: false
		},
		description: {
			type: String,
			required: false
		},
		guild: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Guild',
			required: true
		},
		creator: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'User',
			required: false
		},
		referrer: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'User',
			required: false
		},
		campaign: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Campaign',
			required: false
		},
		channel: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Channel',
			required: false
		},
	}
));

module.exports = Invite;