import { Collection } from 'discord.js';
import discordClient from '../../discord/index.js';
import Campaign from '../models/campaigns.js';
import Guild from '../models/guilds.js'
import Invite from '../models/invites.js';
import mongoToDiscordId from './idConversion/mongoToDiscordId.js';
import saveInvite from './saveInvite.js';

export default async function getInvite ( campaignCode, authenticatedUser ) {

    if ( !campaignCode ){
        throw new Error("getInvite() - CampaignCode parameter is missing and required");
    }

    // GET campaign for mainInvite config
    const campaignFromDb = await Campaign.findOne({ code: campaignCode });
    {if ( !campaignFromDb ){
        throw new Error(`getInvite() - Campaign with code ${campaignCode} not found in DB `);
    }}

    // GET guild for Auth and Main channel config
    const guildFromDb = await Guild.findById( campaignFromDb.guild );
    if ( !guildFromDb ){
        throw new Error(`getInvite() - Guild with id ${campaignFromDb.guild} not found in DB for campaign code: ${campaignCode}`);
    }

    if ( !guildFromDb.auth ) {

        const invite = Invite.findOne({ code :  campaignFromDb.mainInvite }) // REPLACE BY VIRTUAL

        const client = await discordClient();
        const guild = await client.guilds.cache.find(guild => guild.id === mongoToDiscordId( campaignFromDb.guild.toString() )); // SIMPLIFY WITH GET()

        // Renew campaign's main invite if expire in less than 1 min
        const in1minTimestamp = (new Date()).getTime() + 60000 ;

        const cachedCampaign = client.campaigns.get(guild.id).get( campaignCode );
        if ( !cachedCampaign ) {
            client.campaigns.get(guild.id).set( campaignCode, new Collection() );
            client.campaigns.get(guild.id).get( campaignCode ).set("mainInvite", {});
        }

        let mainInvite = client.campaigns.get(guild.id).get( campaignCode ).get( "mainInvite");
        
        if ( !(mainInvite?._expiresTimestamp > in1minTimestamp) ){
            const channel = await guild.channels.cache.find(channel => channel.id === mongoToDiscordId( guildFromDb.channel.toString() ));
            const newInvite = await channel.createInvite({ maxAge: 300, unique: true });
            const savedInvite = await saveInvite( newInvite, campaignFromDb.id );
            mainInvite = { code: newInvite.code , _expiresTimestamp: newInvite._expiresTimestamp };
            client.campaigns
                .get(guild.id)
                .get( campaignCode )
                .set( "mainInvite", mainInvite ) // UPDATE THE CACHE
        }

        return mainInvite;

    } else {

        if ( !authenticatedUser ){
            throw new Error(`getInvite() -  authenticatedUser missing for ${ guildFromDb.name }. Campaign code: ${campaignCode}`);
        }

        console.log('authenticatedUser', authenticatedUser)

        const client = await discordClient();
        const guild = await client.guilds.cache.find(guild => guild.id === mongoToDiscordId( campaignFromDb.guild.toString() ));

        // LOOKING for existing invite in cache for joiner
        const cachedCampaign = client.campaigns.get(guild.id).get( campaignCode );
        if ( !cachedCampaign ) {
            client.campaigns.get(guild.id).set( campaignCode, new Collection() );
            client.campaigns.get(guild.id).get( campaignCode ).set( mongoToDiscordId( authenticatedUser.id.toString() ), {} );
        }

        let joinerInvite = client.campaigns.get(guild.id).get( campaignCode ).get( mongoToDiscordId( authenticatedUser.id.toString() ))
        console.log('joinerInvite', joinerInvite)

        
        const in1minTimestamp = (new Date()).getTime() + 60000 ;
        if ( joinerInvite?._expiresTimestamp > in1minTimestamp ){

            return joinerInvite

        } else { // new invite if joinerInvite doesn't exist or expires in less than 1 min

            const channel = await guild.channels.cache.find(channel => channel.id === mongoToDiscordId( guildFromDb.channel.toString() ));
            const newInvite = await channel.createInvite({ maxUses: 1, maxAge: 300, unique: true });
            const savedInvite = await saveInvite( newInvite, campaignFromDb.id, authenticatedUser.id );
            console.log('saved invite:',savedInvite);
            joinerInvite = { code: newInvite.code , _expiresTimestamp: newInvite._expiresTimestamp };
            client.campaigns
                .get(guild.id)
                .get( campaignCode )
                .set( mongoToDiscordId( authenticatedUser.id.toString()), joinerInvite );
            
            return joinerInvite;
        } 
    }
}