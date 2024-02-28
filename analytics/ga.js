import { createHash } from 'crypto'

export default async function ga ( guildId, measurementId, apiSecret, clientId, userId, events, debug = false ) {

    const memberIdforGA = createHash("sha256").update( guildId + userId ).digest('base64') // Add a salt ...guild or bot level ?
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