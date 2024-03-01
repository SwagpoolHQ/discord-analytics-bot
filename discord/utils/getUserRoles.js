
export default async function getUserRoles(guild, user) {

    // Check DiscordJS beginners guide => Fetch a members roles list for a guild

    const roles = await user
    const owner = await guild.client.users.fetch(guild.ownerId);
    const user = await guild.members.fetch(user.id);

    return roles
}