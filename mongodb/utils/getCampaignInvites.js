//const Invite = require('../models/invites');
import Invite from '../models/invites.js';
//const Campaign = require('../models/campaigns');
import Campaign from '../models/campaigns.js';

//const mongodb = require('mongoose');
import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;

//const discordToMongoId = require('./idConversion/discordToMongoId');
import discordToMongoId from './idConversion/discordToMongoId.js';

export default async function getCampaignInvites ( campaignId ) {

  if( !campaignId ){
    console.log("Error - getCampaignData : missing campaignId")
  } else {

    // ADD FILTER on joinersMembers for: startTimestamp < "joinedAtTimestamp" < endTimestamp
    try {

      const invites = await Invite.find({ campaign: new ObjectId( discordToMongoId( campaignId )) });
        
      return invites;

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

//module.exports = getCampaignInvites;