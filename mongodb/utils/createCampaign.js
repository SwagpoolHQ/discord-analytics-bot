const Campaign = require('../models/campaigns');
const Invite = require('../models/invites');

const mongodb = require('mongoose');
const { ObjectId } = mongodb.Types;

const saveMember = require('./saveMember');
const saveInvite = require('./saveInvite');

const discordToMongoId = require('./idConversion/discordToMongoId');

async function createCampaign ( creatorMember, name, channel ) {

    if( await Campaign.findOne({ name }) ){
        return {
            status : 500,
            message : "This campaign name already exists"
        }
    }

    try {
            if (channel) {
                const newInvite = await channel.createInvite({ maxAge: 0, unique: true });

                const memberFromDb = await saveMember( creatorMember );
                const inviteFromDb = await saveInvite( newInvite );

                const newCampaign = new Campaign({
                    name,
                    description: '',
                    guild: new ObjectId(discordToMongoId(creatorMember.guild.id)),
                    creator: memberFromDb._id,
                });

                try {
                    const savedCampaign = await newCampaign.save()
                    
                    await Invite.updateOne( {code: inviteFromDb.code} , {campaign: savedCampaign._id, referrer: null} );
                    const updatedInviteFromDb = await Invite.findOne( {code: inviteFromDb.code} );

                    return {
                        status : 200,
                        invite: updatedInviteFromDb,
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

module.exports = createCampaign;