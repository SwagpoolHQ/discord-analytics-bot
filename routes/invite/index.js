import express from "express";
import fs from "fs/promises";
import { discordLoginRouter } from './discord.js';

import Campaign from "../../mongodb/models/campaigns.js";
import createInviteRT from "../../mongodb/utils/createInviteRT.js";

export const inviteRouter = express.Router();

inviteRouter.use(discordLoginRouter);

inviteRouter.get('/:code', async function(req, res, next) {
  
  try {
    const campaignFromDb = await Campaign.findOne({ code: req.params.code });

    if (campaignFromDb) {

      // => zOsqrnIH

      if (campaignFromDb.auth && !res.locals.user) {

        const htmlFile = await fs.readFile("routes/invite/index.html");

	      return res.setHeader("Content-Type", "text/html").status(200).send(htmlFile);

      } else if (campaignFromDb.auth && res.locals.user) {
        return res.redirect(`/invite/campaign/${campaignFromDb.id.toString()}/${res.locals.user.id.toString()}`);
      }

      return res.redirect(`/invite/campaign/${campaignFromDb.id.toString()}`);
      
    } else {
      res.status(404).end();
		  return;
    }
    
  } catch (e) {
    res.status(404).end();
		return;
  }
    
});

inviteRouter.get('/campaign/:campaign', async function(req, res, next) {

  try {

    const newInviteFromDb = await createInviteRT( req.params.campaign );
    return res.redirect(`https://discord.gg/${newInviteFromDb.code}`);

  } catch (e) {
    res.status(404).end();
		return;
  }

});

inviteRouter.get('/campaign/:campaign/:user', async function(req, res, next) {

  try {
    console.log('user: ', req.params.user)
    const newInviteFromDb = await createInviteRT( req.params.campaign );
    return res.redirect(`https://discord.gg/${newInviteFromDb.code}`);

  } catch (e) {
    res.status(404).end();
		return;
  }

});

