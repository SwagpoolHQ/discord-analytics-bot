const Invite = require('../models/invites');
const Campaign = require('../models/campaigns');

const mongodb = require('mongoose');
const { ObjectId } = mongodb.Types;

const discordClient = require('../../discord/index');
const saveMember = require('./saveMember');
const saveInvite = require('./saveInvite');

const discordToMongoId = require('./idConversion/discordToMongoId');
const mongoToDiscordId = require('./idConversion/mongoToDiscordId')

async function createInviteRT ( campaignId ) {

  if( !campaignId ){
    console.log("Error - createInviteForCampaign : missing campaignId")
  } else {

    try {

      const campaignFromDb = await Campaign.findOne( {_id: campaignId} );

      const client = await discordClient();
      const guild = await client.guilds.cache.find(guild => guild.id == mongoToDiscordId( campaignFromDb.guild.toString() ));
      let channel = await guild.channels.cache.find(channel => channel.id == mongoToDiscordId( campaignFromDb.channel.toString() ));

      if (!channel){
        await guild.channels.fetch()
        channel = await guild.channels.cache.find(channel => channel.id == mongoToDiscordId( campaignFromDb.channel.toString() ));
      }

        if ( channel ) {
    
          const newInvite = await channel.createInvite({ maxUses: 1, maxAge: 300, unique: true });

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
        console.error('Error querying Campaign collection:', error);
        }
    }
  }
}

module.exports = createInviteRT;