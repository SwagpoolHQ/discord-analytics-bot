const { Events } = require('discord.js');

const saveInvite = require('../../mongodb/utils/saveInvite');

module.exports = {
	name: Events.InviteCreate,
	execute(invite) {
		console.log(`${invite.url} invitation created`);
        // Update cache on new invites
        invite.client.invites.get(invite.guild.id).set(invite.code, { uses: invite.uses, maxUses: invite.maxUses , maxAge: invite.maxAge });
		// Save invite in DB
		saveInvite(invite);
	},
};