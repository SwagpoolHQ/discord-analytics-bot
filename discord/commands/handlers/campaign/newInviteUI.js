//const { hideLinkEmbed, channelMention } = require('discord.js');
import { hideLinkEmbed, channelMention } from 'discord.js';

import mongoToDiscordId from '../../../../mongodb/utils/idConversion/mongoToDiscordId.js';


	const newInviteUI = ( invite ) => {

		let message = '--';
		if( invite ){

			message = `💡 You can copy and share this new invite for ${ channelMention( mongoToDiscordId( invite.channel.toString() )) }:\n`
			message += '------------------------------------------------\n'
			message += `|    ${ hideLinkEmbed( `https://safediscord.com/link/${ invite.campaign }` ) }\n`
			message += '------------------------------------------------\n'
		}
		
		return message;
		
	};

//module.exports = newInviteUI;

export default newInviteUI;