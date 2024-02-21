import express from "express";

export const usersRouter = express.Router();

/*
// GET users listing.
usersRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
*/

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
