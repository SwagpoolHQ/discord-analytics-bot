const mongodb = require("mongoose");

const Channel = mongodb.models.Channel || mongodb.model("Channel",
new mongodb.Schema(
	{
        discordId: {
			type: String,
			required: false
		},
		name: {
			type: String,
			required: false
		},
		guild: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Guild',
			required: false
		},
	}
));

module.exports = Channel;