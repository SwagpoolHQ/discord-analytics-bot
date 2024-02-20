import express from "express";
import fs from "fs/promises";
import { discordLoginRouter } from './discord.js';
import { parseCookies, serializeCookie } from "oslo/cookie";

import Campaign from "../../mongodb/models/campaigns.js";
import Guild from '../../mongodb/models/guilds.js'
import getInvite from "../../mongodb/utils/getInvite.js";

export const inviteRouter = express.Router();

inviteRouter.use(discordLoginRouter);

inviteRouter.get('/:code', async function(req, res, next) {
  
  try {
    let invite = null;
    const campaignFromDb = await Campaign.findOne({ code: req.params.code });
    const guildFromDb = await Guild.findById( campaignFromDb?.guild );

    if (!campaignFromDb || !guildFromDb) {
      res.status(404).end();
		  return;
    };

    if ( !guildFromDb.auth ) {

      invite = await getInvite(req.params.code);

      return res
        .appendHeader(
          "Set-Cookie",
          serializeCookie("invite_code", req.params.code, {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 60 * 10,
            sameSite: "lax"
          }))
        .redirect(`https://discord.gg/${invite?.code}`);

    } else if ( res.locals.user ) {

      try {
        invite = await getInvite(req.params.code, res.locals.user);
        await getInvite(req.params.code);
        await getInvite();
      } catch(e) {
        console.error(e)
      }

    return res
      .appendHeader(
        "Set-Cookie",
        serializeCookie("invite_code", req.params.code, {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          maxAge: 60 * 10,
          sameSite: "lax"
        }))
      .redirect(`https://discord.gg/${invite?.code}`);

    } else {

      const htmlFile = await fs.readFile("routes/invite/index.html");

      return res
            .appendHeader(
              "Set-Cookie",
              serializeCookie("invite_code", req.params.code, {
                path: "/",
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
                maxAge: 60 * 10,
                sameSite: "lax"
              }))
              .setHeader("Content-Type", "text/html").status(200).send(htmlFile);
        
    }
  } catch (e) {
    console.error(e)
    res.status(404).end();
		return;
  }
});
