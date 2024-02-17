//const express = require('express');
import express from "express";

//const getReferrers = require('../mongodb/utils/getReferrers')
//const getMemberProfile = require('../mongodb/utils/getMemberProfile')
//const getCampaignData = require('../mongodb/utils/getCampaignData')

//const Campaign = require('../mongodb/models/campaigns');
import Campaign from "../mongodb/models/campaigns.js";
//const discordClient = require('../discord/index');
//const createInviteRT = require('../mongodb/utils/createInviteRT')
import createInviteRT from "../mongodb/utils/createInviteRT.js";

export const linkRouter = express.Router();

linkRouter.get('/:campaignId', async function(req, res, next) {

  try {
    const campaignFromDb = await Campaign.findOne( {_id: req.params.campaignId} );
    const newInviteFromDb = await createInviteRT( req.params.campaignId );
  
    console.log(req.params.campaignId);
    console.log(campaignFromDb);
    console.log(newInviteFromDb);

    res.redirect(`https://discord.gg/${newInviteFromDb.code}`)
  } catch (e) {
    console.error(e)
    res.json({error:404})
  }
    
});



/*
// GET inviters
linkRouter.get('/inviters/:guildId', async function(req, res, next) {

  const referralPeriod = await getReferrers( req.params.guildId );
  res.json({
    result : true,
    guildId : req.params.guildId,
    referralPeriod: referralPeriod,
    });
});

// GET memberProfile
linkRouter.get('/member/:guildId/:userId', async function(req, res, next) {

  const memberProfile = await getMemberProfile( req.params.guildId, req.params.userId );
  res.json({
    result : true,
    memberProfile,
    });
});

// GET campaignData
linkRouter.get('/campaign/:campaignId', async function(req, res, next) {

  const campaignData = await getCampaignData( req.params.campaignId );
  res.json({
    result : true,
    campaignData,
    });
});
*/

//module.exports = linkRouter;
