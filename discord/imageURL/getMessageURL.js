export default function getMessageURL( guildId, channelId, messageId ) {

    if ( !guildId || !channelId || !messageId ){ return null}

    const baseURL = 'https://discord.com/channels/';
    const path = `${guildId}/${channelId}/${messageId}`;

    return baseURL+path;
};

//module.exports = getMessageURL;