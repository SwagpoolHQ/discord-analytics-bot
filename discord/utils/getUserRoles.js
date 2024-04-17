import discordClient from "../../discord/index.js";

export default async function getUserRoles(guildId, userId) {

    // Check DiscordJS beginners guide => https://anidiots.guide/understanding/roles/

    if (!guildId || !userId) {
        throw new Error(`Parameter required => guildId: ${!!guildId ? '✅' : '❌'}, userId: ${!!userId ? '✅' : '❌'}.`)
    }

    const client = await discordClient()

    const guild = client.guilds.cache.get(guildId);
    const member = guild?.members.cache.get(userId)

    let roles = member?.roles.cache;
    let userRoles = [];
    if (!roles) {
        // get role by ID
        //roles = guild.roles.cache.get( userId );
        //roles = await member.roles.fetch( userId );
    } else {
        userRoles = roles.map(item => item.name);
    }

    // get role by name
    //let myRole = message.guild.roles.cache.find(role => role.name === "Moderators");

    /*
    // assuming role.id is an actual ID of a valid role:
    if (message.member.roles.cache.has(role.id)) {
        console.log("Yay, the author of the message has the role!");
    }
    */

    /*
    // Check if they have one of many roles
    if (message.member.roles.cache.some(r=>["Dev", "Mod", "Server Staff", "Proficient"].includes(r.name)) ) {
        // has one of the roles
    }
    */

    return userRoles
}