import express from "express";
import fs from "fs/promises";
import { discordLoginRouter } from './discord.js';
import { parseCookies, serializeCookie } from "oslo/cookie";
import baseURL from '../../utils/baseURL.js'
import debug from '../../utils/debug.js';

import Campaign from "../../mongodb/models/campaigns.js";
import Guild from '../../mongodb/models/guilds.js'
import getInvite from "../../mongodb/utils/getInvite.js";

export const inviteRouter = express.Router();

inviteRouter.use(discordLoginRouter);

inviteRouter.get('/:code', async function (req, res, next) {

  /*
  const storedClientId = parseCookies(req.headers.cookie ?? "").get("_ga") ?? null;
  res.locals.user.clientId = storedClientId?.replace(/^GA1.1\./, '');
  */

  try {
    let invite = null;
    const campaignFromDb = await Campaign.findOne({ code: req.params.code });
    const guildFromDb = await Guild.findById(campaignFromDb?.guild);

    if (!campaignFromDb || !guildFromDb) {
      res.status(404).end();
      return;
    };

    if (guildFromDb.auth && !res.locals.user?.discordId) {
      // Comment out GA related replacements
      const htmlFile = await fs.readFile("routes/invite/index.html");
      let template = htmlFile.toString("utf-8");
      template = template.replaceAll("%code%", req.params.code);
      // Comment these GA related lines
      /*
      template = template.replaceAll("%measurementId%", process.env.GA_MEASUREMENT_ID);
      if (guildFromDb.gaTag) template = template.replaceAll("%measurementIdClient%", guildFromDb.gaTag);
      */

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
        .setHeader("Content-Type", "text/html").status(200).send(template);

    } else {

      // WARNING => Should I redirect user in frontend or backend here ?
      /*
      console.log('gaTag: ', guildFromDb.gaTag)
      // INIT GOOGLE ANALYTIC IF NO GOOGLE ANALYTICS CLIENT_ID FOUND IN COOKIES
      const gaClientCookieCode = guildFromDb.gaTag?.replace(/^G\-/, ''); //enlever le prefix G- de guildFromDb.gaTag 
      console.log('client Tag', `_ga_${gaClientCookieCode}`);
      const storedClientTag = parseCookies(req.headers.cookie ?? "").get(`_ga_${gaClientCookieCode}`) ?? null;
      console.log('client tag id', storedClientTag)
      
      if (!storedClientTag) {
        const templateFile = await fs.readFile("routes/invite/tag.html");
        let template = templateFile.toString("utf-8");
        template = template.replaceAll("%url%", `${baseURL}/invite/${req.params.code}`);
        template = template.replaceAll("%code%", req.params.code);
        template = template.replaceAll("%measurementId%", process.env.GA_MEASUREMENT_ID);
        if (guildFromDb.gaTag) template = template.replaceAll("%measurementIdClient%", guildFromDb.gaTag);

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
          .setHeader("Content-Type", "text/html").status(200).send(template);
      }
      */
      debug("res.locals.user: ", res.locals.user);
      debug("Starting invite process for code:", req.params.code);
      debug("User data:", res.locals.user);

      invite = await getInvite(req.params.code, res.locals.user);
      debug("Returned invite object:", invite);

      if (!invite?.code) {
        debug("No invite code returned");
        return res.status(500).send("Failed to generate invite");
      }

      debug("Redirecting to:", `https://discord.gg/${invite.code}`);

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
        .redirect(`https://discord.gg/${invite.code}`);
    }
  } catch (e) {
    debug("Error in invite process:", e);
    res.status(404).end();
    return;
  }
});
