
// OLD DRAFT...NOT FUNCTIONNAL, TO BE CLEANED.

export default async function saveGuildMembers(guild) {
    
    const members = new Map();

    try {
      await guild.members.fetch(); // Fetch all members using the built-in method
  
      // Use the each method to iterate over all members
      guild.members.cache.each((member) => {

        if (member.user.bot) {
            return; // Skip bots
          }
        
        const memberInfo = {
            user_id: member.id,
            username: member.user.username,
            roles_array: member.roles.cache.map((role) => role.id),
            permissions: member.permissions.toArray(),
          };

        console.log(memberInfo)

        members.set(member.id, member);
      });
    } catch (error) {
      console.error(`Error fetching members: ${error.message}`);
    }
  
    console.log(`Total members fetched for guild ${guild.name}: ${members.size}`);
    return members;

};