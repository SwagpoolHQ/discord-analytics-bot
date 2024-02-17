//const { userMention, time } = require('discord.js');
import { userMention, time } from 'discord.js';


	const lastCampaignJoinersUI = (joiners, number) => {

		let message = '--';
		if( joiners[0] ){

			message = '---------------------------------------------------------\n'
			for (let i = 0; i < Math.min(joiners.length, number); i++) {
				message += `${userMention(joiners[i].user.discordId)} joined ${time(joiners[i].joinedAtTimestamp, 'R')}\n`
			}
			//message += '---------------------------------------------------------'

		}
		
		return message;
		
	};

//module.exports = lastCampaignJoinersUI;

export default lastCampaignJoinersUI;