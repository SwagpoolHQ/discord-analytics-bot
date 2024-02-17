
export default function mongoToDiscordId(id) {

    const discordId = id.replace(/^0+/, ''); // remove pad 0000

    return discordId;

};

//module.exports = mongoToDiscordId;