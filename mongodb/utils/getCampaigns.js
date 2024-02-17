//const Campaign = require('../models/campaigns');
import Campaign from '../models/campaigns.js';

//const mongodb = require('mongoose');
import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;

//const discordToMongoId = require('./idConversion/discordToMongoId');
import discordToMongoId from './idConversion/discordToMongoId.js';

export default async function getCampaigns ( guildId ) {

    const campaigns = await Campaign.find({ guild: new ObjectId(discordToMongoId(guildId)) });
    return campaigns;

}

//module.exports = getCampaigns;