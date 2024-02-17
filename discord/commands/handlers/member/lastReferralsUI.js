//const { userMention, time } = require('discord.js');
import { userMention, time } from 'discord.js';


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

//module.exports = lastReferralsUI;
export default lastReferralsUI;