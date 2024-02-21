import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;
import Campaign from '../models/campaigns.js';
import discordToMongoId from './idConversion/discordToMongoId.js';

export default async function getCampaigns ( guildId ) {

    const campaigns = await Campaign.find({ guild: new ObjectId(discordToMongoId(guildId)) });
    return campaigns;

}