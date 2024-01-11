const { userMention, time } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;


	const lastReferralsUI = (referrals, number = 3) => {

		let message = '--';
		if( referrals[0] ){

			message = '---------------------------------------------------------\n'
			for (let i = 0; i < Math.min(referrals.length, number); i++) {
				message += `${userMention(referrals[i].user.discordId)} joined ${time(referrals[i].joinedAtTimestamp, 'R')}\n`
			}
			//message += '---------------------------------------------------------'

		}
		
		return message;
		
	};

module.exports = lastReferralsUI;