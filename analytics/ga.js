import { createHash } from 'crypto'

export default async function ga ( guildId, clientId, userId, events, debug = false ) {

    // HERE: guildId must be used to retrieve the "measurementId" and "apiSecret" to send the event
    const measurementId = 'G-2RSPNCH2FD';
    const apiSecret = process.env.GA_SECRET_KEY;

    const memberIdforGA = createHash("sha256").update( userId ).digest('base64') // Add a salt... bot level !
    console.log("memberIdforGA", memberIdforGA)

    const queryParams = `?measurement_id=${measurementId}&api_secret=${apiSecret}`; 
    const queryUrl = debug 
        ? 'https://www.google-analytics.com/debug/mp/collect' 
        : 'https://www.google-analytics.com/mp/collect'

    if (!debug){
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
        console.log('ga fired', queryUrl + queryParams)
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