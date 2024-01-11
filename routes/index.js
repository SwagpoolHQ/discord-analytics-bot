var express = require('express');
var router = express.Router();

const getReferrers = require('../mongodb/utils/getReferrers')
const getMemberProfile = require('../mongodb/utils/getMemberProfile')
const getCampaignData = require('../mongodb/utils/getCampaignData')

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
