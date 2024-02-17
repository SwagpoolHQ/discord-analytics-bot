//const mongodb = require("mongoose");
import mongodb from 'mongoose';

const Session = mongodb.models.Session || mongodb.model("Session",
new mongodb.Schema(
	{
        _id: {
            type: String,
            required: true
        },
        user_id: {
            type: String,
            required: true
        },
        expires_at: {
            type: Date,
            required: true
        }
    },
	{ _id: false }
));

//module.exports = Session;
export default Session;