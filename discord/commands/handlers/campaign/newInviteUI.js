const { hideLinkEmbed, channelMention } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const mongoToDiscordId = require('../../../../mongodb/utils/idConversion/mongoToDiscordId')


	const newInviteUI = ( invite ) => {

		let message = '--';
		if( invite ){

			message = `💡 You can copy and share this new invite for ${ channelMention( mongoToDiscordId( invite.channel.toString() )) }:\n`
			message += '------------------------------------------------\n'
			message += `|    ${ hideLinkEmbed( `https://discord.gg/${ invite.code }` ) }\n`
			message += '------------------------------------------------\n'
		}
		
		return message;
		
	};

module.exports = newInviteUI;