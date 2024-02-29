import { Collection } from 'discord.js';
import discordClient from '../../discord/index.js';
import Campaign from '../models/campaigns.js';
import Guild from '../models/guilds.js'
import Invite from '../models/invites.js';
import mongoToDiscordId from './idConversion/mongoToDiscordId.js';
import saveInvite from './saveInvite.js';

export default async function getInvite ( campaignCode, user ) {

    if ( !campaignCode ){
        throw new Error(`campaignCode parameter is missing and required. user: ${user} `);
    }

    if ( !user ){
        throw new Error(`user parameter is missing and required. campaignCode: ${campaignCode}`);
    }

    console.log('user', user)

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

    const client = await discordClient();
    const guild = await client.guilds.cache.find(guild => guild.id === mongoToDiscordId( campaignFromDb.guild.toString() ));

    // MANAGING case between authenticated and non-authenticated users
    const userId = user.discordId ? user.discordId : user.clientId;
    console.log( 'userId: ', userId );

    // LOOKING for existing invite in cache for joiner
    const cachedCampaign = client.campaigns.get(guild.id).get( campaignCode );
    if ( !cachedCampaign ) {
        
        // ADD MongoDB fetch HERE for Campaign & Guild data

        client.campaigns.get(guild.id).set( campaignCode, new Collection() );
        client.campaigns.get(guild.id).get( campaignCode ).set( userId, {} );
    } 
    
    let joinerInvite = client.campaigns.get(guild.id).get( campaignCode ).get( userId )
        
    const in1minTimestamp = (new Date()).getTime() + 60000 ;
    if ( joinerInvite?._expiresTimestamp > in1minTimestamp ){

            return joinerInvite

        } else { // new invite if joinerInvite doesn't exist or expires in less than 1 min

            const channel = await guild.channels.cache.find(channel => channel.id === mongoToDiscordId( guildFromDb.channel.toString() ));
            const newInvite = await channel.createInvite({ maxUses: 1, maxAge: 300, unique: true });
            const savedInvite = await saveInvite( newInvite, campaignFromDb.id, userId );
            console.log('saved invite:',savedInvite);
            joinerInvite = { code: newInvite.code , _expiresTimestamp: newInvite._expiresTimestamp };
            client.campaigns
                .get(guild.id)
                .get( campaignCode )
                .set( userId, joinerInvite );
            
            return joinerInvite;
        } 
}