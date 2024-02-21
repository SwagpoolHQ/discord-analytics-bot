
export default async function cleanCampaignsCache ( guild ) {

    const now = (new Date()).getTime() ;

    guild.client.campaigns.get( guild.id ).forEach(element => {
        
        for (const code of element.keys()){

            if ( element.get(code)._expiresTimestamp < now ){
                element.delete(code)
            }
        }
    });

    console.log('campaigns',guild.client.campaigns.get( guild.id ))

}