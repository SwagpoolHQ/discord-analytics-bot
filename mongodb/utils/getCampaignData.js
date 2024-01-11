const Invite = require('../models/invites');
const Campaign = require('../models/campaigns');

const mongodb = require('mongoose');
const { ObjectId } = mongodb.Types;

const discordToMongoId = require('./idConversion/discordToMongoId');

async function getCampaignData ( campaignId ) {

  if( !campaignId || !ObjectId.isValid(campaignId) ){
    console.log("Error - getCampaignData : missing campaignId")
    return null;
  } else {
    
    // Computing the start timestamps for the required period
    const endTimestamp = new Date().getTime(); // this is now
    const startLast1dTimestamp  = endTimestamp - 1 * 24 * 60 * 60 * 1000; // The last 1 days in millisecondes from now.
    const startLast7dTimestamp  = endTimestamp - 7 * 24 * 60 * 60 * 1000; // The last 7 days in millisecondes from now.
    const startLast1mTimestamp  = endTimestamp - 30 * 24 * 60 * 60 * 1000; // The last 30 days in millisecondes from now.

    try {

      const joiners = await Invite.aggregate([
          {
            $match: {
              //guild: new ObjectId( discordToMongoId(guildId) ),
              campaign: new ObjectId( discordToMongoId( campaignId ) ),
            },
          },
          {
            $lookup: {
              from: 'members',
              localField: '_id',
              foreignField: 'invite',
              as: 'joinersMembers',
            },
          },
          {
            $unwind: '$joinersMembers',
          },
          {
            $lookup: {
              from: 'users',
              localField: 'joinersMembers.user',
              foreignField: '_id',
              as: 'joinerUser',
            },
          },
          {
            $sort: {
              'joinersMembers.joinedAtTimestamp': -1, // Sorting in descending order
            },
          },
          {
            $unwind: '$joinerUser',
          },
          {
            $project: {
              user: '$joinerUser', // Rename 'joinerUser' to 'user'
              joinedAtTimestamp: '$joinersMembers.joinedAtTimestamp', // Include 'joinedAtTimestamp'
              leftAtTimestamp: '$joinersMembers.leftAtTimestamp', // Include 'leftAtTimestamp'
            },
          },
        ]);

        const campaign = await Campaign.findById( new ObjectId( discordToMongoId( campaignId )) );

        const nbOfJoinersLast1d = joiners.reduce( (acc, current) => acc + ( !current.leftAtTimestamp && current.joinedAtTimestamp >= startLast1dTimestamp ? 1 : 0 ), 0);
        const nbOfJoinersLast7d = joiners.reduce( (acc, current) => acc + ( !current.leftAtTimestamp && current.joinedAtTimestamp >= startLast7dTimestamp ? 1 : 0 ), 0);
        const nbOfJoinersLast1m = joiners.reduce( (acc, current) => acc + ( !current.leftAtTimestamp && current.joinedAtTimestamp >= startLast1mTimestamp ? 1 : 0 ), 0);
        const nbOfJoiners = joiners.reduce( (acc, current) => acc + ( !current.leftAtTimestamp ? 1 : 0 ), 0);

        // Formatting memberProfile with referrals data
        const campaignData = {
          campaign,
          nbOfJoinersLast1d,
          nbOfJoinersLast7d,
          nbOfJoinersLast1m,
          nbOfJoiners,
          joiners,
        }
        
        return campaignData;

    } catch (error) {
        // Check if the error is due to a non-existent guildId
        if (error.name === 'CastError' && error.path === 'campaign') {
        // Handle the case where the guildId is not found
        console.error('Campaign not found');
        } else {
        // Handle other errors
        console.error('Error querying members collection:', error);
        }
    }
  }
}

module.exports = getCampaignData;