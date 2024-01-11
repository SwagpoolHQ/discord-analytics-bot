const mongodb = require("mongoose");

const Guild = mongodb.models.Guild || mongodb.model("Guild",
new mongodb.Schema(
	{
        discordId: {
			type: String,
			required: true
		},
		name: {
			type: String,
			required: true
		},
		icon: {
			type: String,
			required: false
		},
		permissions: {
			type: String,
			required: false
		}, 
		owner: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'User',
			required: false
		},
        joinedTimestamp: {
			type: Date,
			required: true
		},
	}
));

module.exports = Guild;