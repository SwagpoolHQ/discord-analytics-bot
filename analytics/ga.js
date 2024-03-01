import { createHash } from 'crypto'
import Guild from '../mongodb/models/guilds.js'
import discordToMongoId from '../mongodb/utils/idConversion/discordToMongoId.js';

export default async function ga ( guildId, clientId, user, events, debug = false ) {

    if ( !guildId || !user?.id || !events ){
        throw new Error(`Parameters required => guildId: ${ !!guildId ? '✅' : '❌' }, user.id: ${ !!user?.id ? '✅' : '❌' }, events: ${ !!events ? '✅' : '❌'}.`)
    }

    // HASH user.id for privacy protection => SHOULD ADD: Salt at bot level !
    const memberIdforGA = createHash("sha256").update( user?.id ).digest('base64');

    // SET core & client analytics parameters
    const measurementId = process.env.GA_MEASUREMENT_ID;
    const apiSecret = process.env.GA_SECRET_KEY;
    const guildFromDb = await Guild.findById( discordToMongoId(guildId) ); // SHOULD BE QUERIED FROM CACHE WITH FALLBACK TO DB

    const queryParams = `?measurement_id=${measurementId}&api_secret=${apiSecret}`; 
    const queryParamsClient = `?measurement_id=${guildFromDb?.gaTag}&api_secret=${guildFromDb?.gaApiKey}`; 
    const queryUrl = debug 
        ? 'https://www.google-analytics.com/debug/mp/collect' 
        : 'https://www.google-analytics.com/mp/collect'

    // EXECUTE based on PROD vs DEBUG config
    if (!debug){
        // SEND event for core analytics
        if ( measurementId && apiSecret ){
            fetch( queryUrl + queryParams, {
                method: "POST",
                body: JSON.stringify({
                    client_id: clientId ? clientId : memberIdforGA,
                    user_id: memberIdforGA,
                    /*user_properties: {
                        member_status: {
                        value: "OG"
                        }
                    },*/
                    events
                })
            });
            console.log('ga fired', queryUrl + queryParams);
        } else {
            console.error(`GA parameters missing from .ENV => GA_MEASUREMENT_ID: ${ !!measurementId ? '✅' : '❌' }, GA_SECRET_KEY: ${ !!apiSecret ? '✅' : '❌' }.`)
        }
        // SEND event for client analytics
        if ( guildFromDb?.gaTag && guildFromDb?.gaApiKey ){
            fetch( queryUrl + queryParamsClient, {
                method: "POST",
                body: JSON.stringify({
                    client_id: clientId ? clientId : memberIdforGA,
                    user_id: memberIdforGA,
                    /*user_properties: {
                        member_status: {
                          value: "OG"
                        }
                      },*/
                    events
                })
            });
        console.log('ga fired', queryUrl + queryParamsClient);
        } else {
            console.error(`GA parameters missing for guildId: ${guildId} => gaTag: ${ !!guildFromDb?.gaTag ? '✅' : '❌' }, gaApiKey: ${ !!guildFromDb?.gaApiKey ? '✅' : '❌' }.`)
        }
        return
    } else {
        const response = await fetch( queryUrl + queryParams, {
            method: "POST",
            body: JSON.stringify({
                client_id: clientId ? clientId : memberIdforGA,
                user_id: memberIdforGA,
                user_properties: {
                    member_status: {
                      value: "OG"
                    }
                  },
                events
            })
        });
        const jsonResponse = await response.json();
        console.log('ga fired in debug', queryUrl + queryParams)
        return jsonResponse
    }
}