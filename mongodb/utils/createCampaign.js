import Campaign from '../models/campaigns.js';
import Guild from '../models/guilds.js'
import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;
import createCampaignCode from './idConversion/createCampaignCode.js'
import saveMember from './saveMember.js';
import saveInvite from './saveInvite.js';
import discordToMongoId from './idConversion/discordToMongoId.js';

export default async function createCampaign ( creatorMember, name, description ) {

    if( await Campaign.findOne({ name }) ){
        return {
            status : 500,
            message : "⚠️ This campaign name already exists"
        }
    }

    const memberFromDb = await saveMember( creatorMember );

    const newCampaign = new Campaign({
        name,
        description,
        code: await createCampaignCode(), //=> "R8_H-myT"
        guild: new ObjectId(discordToMongoId(creatorMember.guild.id)),
        creator: memberFromDb._id,
    });

    return await newCampaign.save();
}