
export default function getGuildIconURL( guildId, iconId, format = 'png', size = '160' ) {

    if (!guildId || !iconId){ return null}

    const baseURL = 'https://cdn.discordapp.com/';
    const path = `icons/${guildId}/${iconId}.${format}?size=${size}`;

    return baseURL+path;
};