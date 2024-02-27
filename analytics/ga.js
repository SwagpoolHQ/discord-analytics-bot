
export default async function ga ( measurementId, apiSecret, events, debug = false ) {

    const queryParams = `?measurement_id=${measurementId}&api_secret=${apiSecret}`; 
    const queryUrl = debug 
        ? 'https://www.google-analytics.com/debug/mp/collect' 
        : 'https://www.google-analytics.com/mp/collect'

    if (!debug){
        fetch( queryUrl + queryParams, {
            method: "POST",
            body: JSON.stringify({
                client_id: `${crypto.randomUUID()}`, // testing vs nanoId
                //client_id: "1908161148.1586721292",
                //user_engagement: "1",
                //user_id: null,
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
                client_id: "RandomUserIdHash",
                user_id: null,
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