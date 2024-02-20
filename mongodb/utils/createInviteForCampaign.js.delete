//const Invite = require('../models/invites');
import Invite from '../models/invites.js';

//const mongodb = require('mongoose');
import mongodb from 'mongoose';
const { ObjectId } = mongodb.Types;

//const saveMember = require('./saveMember');
import saveMember from './saveMember.js';
//const saveInvite = require('./saveInvite');
import saveInvite from './saveInvite.js';

//const discordToMongoId = require('./idConversion/discordToMongoId');
import discordToMongoId from './idConversion/discordToMongoId.js';
//const mongoToDiscordId = require('./idConversion/mongoToDiscordId')
import mongoToDiscordId from './idConversion/mongoToDiscordId.js';

export default async function createInviteForCampaign ( creatorMember, campaignId ) {

  if( !campaignId ){
    console.log("Error - createInviteForCampaign : missing campaignId")
  } else {

    try {

      const invite = await Invite.findOne({ campaign : campaignId });

      await creatorMember.guild.channels.fetch()
      const channel = await creatorMember.guild.channels.cache.find(channel => channel.id == mongoToDiscordId( invite.channel.toString() ));

        if ( channel ) {
    
          const newInvite = await channel.createInvite({ maxAge: 0, unique: true });

          const memberFromDb = await saveMember( creatorMember );
          const inviteFromDb = await saveInvite( newInvite );

          await Invite.updateOne( {code: inviteFromDb.code} , {campaign: new ObjectId( discordToMongoId(campaignId) ), referrer: null} );
          const updatedInviteFromDb = await Invite.findOne( {code: inviteFromDb.code} );

          return updatedInviteFromDb;

        } else {
          console.log(`No text channels found for ${creatorMember.guild.name}`);
        }
    } catch (error) {
        // Check if the error is due to a non-existent guildId
        if (error.name === 'CastError' && error.path === 'campaign') {
        // Handle the case where the guildId is not found
        console.error('Campaign not found');
        } else {
        // Handle other errors
        console.error('Error querying Invite collection:', error);
        }
    }
  }
}

//module.exports = createInviteForCampaign;