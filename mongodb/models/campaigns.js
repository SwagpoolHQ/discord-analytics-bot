const mongodb = require("mongoose");

const Campaign = mongodb.models.Campaign || mongodb.model("Campaign",
new mongodb.Schema(
	{
		name: {
			type: String,
			required: true
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
		channel: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Channel',
			required: false
		},
	}
));

module.exports = Campaign;