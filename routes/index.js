var express = require('express');
var router = express.Router();

const getReferrers = require('../mongodb/utils/getReferrers')
const getMemberProfile = require('../mongodb/utils/getMemberProfile')
const getCampaignData = require('../mongodb/utils/getCampaignData')

const Campaign = require('../mongodb/models/campaigns');
const discordClient = require('../discord/index');
const createInviteRT = require('../mongodb/utils/createInviteRT')


router.get('/:campaignId', async function(req, res, next) {


  const campaignFromDb = await Campaign.findOne( {_id: req.params.campaignId} );
  const newInviteFromDb = await createInviteRT( req.params.campaignId );
  
  console.log(req.params.campaignId);
  console.log(campaignFromDb);
  console.log(newInviteFromDb);

  res.redirect(`https://discord.gg/${newInviteFromDb.code}`)
});



/*
// GET inviters
router.get('/inviters/:guildId', async function(req, res, next) {

  const referralPeriod = await getReferrers( req.params.guildId );
  res.json({
    result : true,
    guildId : req.params.guildId,
    referralPeriod: referralPeriod,
    });
});

// GET memberProfile
router.get('/member/:guildId/:userId', async function(req, res, next) {

  const memberProfile = await getMemberProfile( req.params.guildId, req.params.userId );
  res.json({
    result : true,
    memberProfile,
    });
});

// GET campaignData
router.get('/campaign/:campaignId', async function(req, res, next) {

  const campaignData = await getCampaignData( req.params.campaignId );
  res.json({
    result : true,
    campaignData,
    });
});
*/

module.exports = router;
