import mongodb from 'mongoose';

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
		auth: {
			type: Boolean,
			default: false,
			required: false,
		},
		channel: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Channel',
			required: false
		},
		gaTag: {
			type: String,
			required: false
		},
		gaApiKey: {
			type: String,
			required: false
		},
	}
));

export default Guild;