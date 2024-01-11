const { Events } = require('discord.js');

module.exports = {
	name: Events.InviteDelete,
	execute(invite) {
		// Delete the Invite from Cache
		console.log(`invite ${invite.code} deleted`);

		// Convert the string to a Date object
		const deletedAtDate = new Date();
		// Get the timestamp (UNIX timestamp) from the Date object
		const deletedAtTimestamp = deletedAtDate.getTime();

		invite.client.invites.get(invite.guild.id).set(invite.code, { deletedAtTimestamp });
		console.log(`deleted invite`, invite.client.invites.get(invite.guild.id).get(invite.code) );
		
		console.log('saved invites on delete event : ', invite.client.invites.get(invite.guild.id));
	},
};