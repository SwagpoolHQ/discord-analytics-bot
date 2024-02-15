const { hideLinkEmbed, channelMention } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const mongoToDiscordId = require('../../../../mongodb/utils/idConversion/mongoToDiscordId')


	const invitesListUI = (invites, number = 3 ) => {

		let message = '--';
		if( invites[0] ){

			message =`💡 You can copy and use one of these invites for ${ channelMention( mongoToDiscordId( invites[0].channel.toString() )) }\n`
			message += '------------------------------------------------\n';
			message += `|    ${ hideLinkEmbed( `https://safediscord.com/${ invites[0].campaign }` ) }\n`;
			for (let i = 0; i < Math.min( invites.length, number ); i++) {
				message += `|    ${ hideLinkEmbed( `https://discord.gg/${ invites[i].code }` ) }\n`
			}
			message += '------------------------------------------------\n'
		}
		
		return message;
		
	};

module.exports = invitesListUI;