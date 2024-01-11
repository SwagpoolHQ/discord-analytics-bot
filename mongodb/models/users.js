const mongodb = require("mongoose");

const User = mongodb.models.User || mongodb.model("User",
new mongodb.Schema(
	{
        discordId: {
			type: String,
			required: false
		},
		createdAtTimestamp: {
			type: Date,
			required: false
		},
		username: {
			type: String,
			required: true
		},
		globalName: {
			type: String,
			required: false
		},
		discriminator: {
			type: String,
			required: false
		},
		isBot: {
			type: Boolean,
			required: false
		},
		isSystem: {
			type: Boolean,
			required: false
		},
		avatar: {
			type: String,
			required: false
		},
		banner: {
			type: String,
			required: false
		},
		permissions: {
			type: [String], // This specifies that "roles" is an array of strings
			required: false
		}, 
        roles: {
			type: [String], // This specifies that "roles" is an array of strings
			required: false
		},
	}
));

module.exports = User;