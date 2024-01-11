const { userMention, time } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;


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

module.exports = lastCampaignJoinersUI;