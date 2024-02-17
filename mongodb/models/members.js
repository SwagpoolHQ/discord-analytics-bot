//const mongodb = require("mongoose");
import mongodb from 'mongoose';

const Member = mongodb.models.Member || mongodb.model("Member",
new mongodb.Schema(
	{
		joinedAtTimestamp: {
			type: Date,
			required: false
		},
		leftAtTimestamp: {
			type: Date,
			required: false
		},
		guild: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Guild',
			required: false
		},
		user: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		invite: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Invite',
			required: false
		},
		
	}
));

//module.exports = Member;
export default Member;