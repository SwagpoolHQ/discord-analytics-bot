import Campaign from '../models/campaigns.js';
import Guild from '../models/guilds.js'
import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;
import createCampaignCode from './idConversion/createCampaignCode.js'
import saveMember from './saveMember.js';
import saveInvite from './saveInvite.js';
import discordToMongoId from './idConversion/discordToMongoId.js';

export default async function createCampaign ( creatorMember, name, channel ) {

    if( await Campaign.findOne({ name }) ){
        return {
            status : 500,
            message : "⚠️ This campaign name already exists"
        }
    }

    if (channel){
        await Guild.updateOne(
            { _id: discordToMongoId(channel.guild.id) },
            { channel: discordToMongoId(channel.id) }
        );
    }

    try {
            if (channel) {
                const newInvite = await channel.createInvite({ maxAge: 0, unique: true });

                const memberFromDb = await saveMember( creatorMember );
                const inviteFromDb = await saveInvite( newInvite );

                const newCampaign = new Campaign({
                    name,
                    description: '',
                    code: await createCampaignCode(), //=> "R8_H-myT"
                    guild: new ObjectId(discordToMongoId(creatorMember.guild.id)),
                    creator: memberFromDb._id,
                    channel: new ObjectId(discordToMongoId(channel.id))
                });

                try {
                    const savedCampaign = await newCampaign.save()
                    
                    //await Invite.updateOne( {code: inviteFromDb.code} , {campaign: savedCampaign._id, referrer: null} );
                    //const updatedInviteFromDb = await Invite.findOne( {code: inviteFromDb.code} );

                    return {
                        status : 200,
                        campaign: savedCampaign,
                        //invite: updatedInviteFromDb,
                    }

                } catch (e) {
                    console.error(e);
                    return {
                        status : 501,
                        message : e
                    }
                }
            } else {
                console.log(`No text channels found for ${creatorMember.guild.name}`);
            }
        } catch (e){
            console.error(e)
        }
}