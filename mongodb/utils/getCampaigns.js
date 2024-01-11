const Campaign = require('../models/campaigns')

const mongodb = require('mongoose');
const { ObjectId } = mongodb.Types;
const discordToMongoId = require('./idConversion/discordToMongoId');

async function getCampaigns ( guildId ) {

    const campaigns = await Campaign.find({ guild: new ObjectId(discordToMongoId(guildId)) });
    return campaigns;

}

module.exports = getCampaigns;