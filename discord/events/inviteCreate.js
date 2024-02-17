//const { Events } = require('discord.js');
import { Events } from 'discord.js';

//const saveInvite = require('../../mongodb/utils/saveInvite');
import saveInvite from '../../mongodb/utils/saveInvite.js';

export const event = {
	name: Events.InviteCreate,
	execute(invite) {
		console.log(`${invite.url} invitation created`);
        // Update cache on new invites
        invite.client.invites.get(invite.guild.id).set(invite.code, { uses: invite.uses, maxUses: invite.maxUses , maxAge: invite.maxAge });
		// Save invite in DB
		//saveInvite(invite); // NOT REQUIRED AND CAN DUPLICATE INVITE CREATION FROM createInviteForCampaign.js
	},
};