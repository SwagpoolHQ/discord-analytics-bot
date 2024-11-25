import { createHash } from 'crypto'
import Guild from '../mongodb/models/guilds.js'
import discordToMongoId from '../mongodb/utils/idConversion/discordToMongoId.js';
import getUserRoles from '../discord/utils/getUserRoles.js';
import debug from 'debug';

export default async function ga(guildId, clientId, user, events, debug = false) {

    if (!guildId || !user?.id || !events) {
        throw new Error(`Parameters required => guildId: ${!!guildId ? '✅' : '❌'}, user.id: ${!!user?.id ? '✅' : '❌'}, events: ${!!events ? '✅' : '❌'}.`)
    }

    // HASH user.id for privacy protection => SHOULD ADD: Salt at bot level !
    const memberIdforGA = createHash("sha256").update(user?.id).digest('base64');

    // GET member roles
    const memberRoles = await getUserRoles(guildId, user.id);
    const roles = {};
    for (let i = 0; i < Math.min(memberRoles.length, 20); i++) {
        const gaRole = `role_${memberRoles[i]}`;
        const cleanedGaRole = gaRole.replace(/[^a-zA-Z0-9_]/g, '');
        roles[cleanedGaRole] = { value: true };
    }
    console.log('roles: ', roles)

    // SET core & client analytics parameters
    const measurementId = process.env.GA_MEASUREMENT_ID;
    const apiSecret = process.env.GA_SECRET_KEY;
    const guildFromDb = await Guild.findById(discordToMongoId(guildId)); // SHOULD BE QUERIED FROM CACHE WITH FALLBACK TO DB

    const queryParams = `?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    const queryParamsClient = `?measurement_id=${guildFromDb?.gaTag}&api_secret=${guildFromDb?.gaApiKey}`;
    const queryUrl = debug
        ? 'https://www.google-analytics.com/debug/mp/collect'
        : 'https://www.google-analytics.com/mp/collect'

    // EXECUTE based on PROD vs DEBUG config
    if (!debug) {
        // SEND event for core analytics
        if (measurementId && apiSecret) {
            fetch(queryUrl + queryParams, {
                method: "POST",
                body: JSON.stringify({
                    client_id: clientId ? clientId : memberIdforGA,
                    user_id: memberIdforGA,
                    user_properties: { ...roles },
                    /*user_properties: {
                        member_status: {
                        value: "OG"
                        }
                    },*/
                    events
                })
            });
            console.log('ga fired for', measurementId);
        } else {
            console.error(`GA parameters missing from .ENV => GA_MEASUREMENT_ID: ${!!measurementId ? '✅' : '❌'}, GA_SECRET_KEY: ${!!apiSecret ? '✅' : '❌'}.`)
        }
        // SEND event for client analytics
        if (guildFromDb?.gaTag && guildFromDb?.gaApiKey) {
            fetch(queryUrl + queryParamsClient, {
                method: "POST",
                body: JSON.stringify({
                    client_id: clientId ? clientId : memberIdforGA,
                    user_id: memberIdforGA,
                    user_properties: { ...roles },
                    /*user_properties: {
                        member_status: {
                          value: "OG"
                        }
                      },*/
                    events
                })
            });
            console.log('ga fired for', guildFromDb?.gaTag);
        } else {
            console.error(`GA parameters missing for guildId: ${guildId} => gaTag: ${!!guildFromDb?.gaTag ? '✅' : '❌'}, gaApiKey: ${!!guildFromDb?.gaApiKey ? '✅' : '❌'}.`)
        }
        return
    } else {
        const response = await fetch(queryUrl + queryParams, {
            method: "POST",
            body: JSON.stringify({
                client_id: clientId ? clientId : memberIdforGA,
                user_id: memberIdforGA,
                user_properties: { ...roles },
                /*user_properties: {
                    property: {
                      value: value
                    }
                  },*/
                events
            })
        });
        const jsonResponse = await response.json();
        console.log('ga fired in debug for', measurementId)
        return jsonResponse
    }
}