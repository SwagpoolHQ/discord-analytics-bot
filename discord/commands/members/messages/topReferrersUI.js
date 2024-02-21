import { userMention } from 'discord.js';

	const topReferrersUI = (referrers) => {

		let message = '--';
		if( referrers[0] ){

			// TO CLEAN BY ADDING SCORE FIELD & SORT IN THE DB QUERY 
			referrers.sort( (a,b) => (b.referredMembersCount - b.referredMembersWhoLeftCount)- (a.referredMembersCount - a.referredMembersWhoLeftCount));

			message = '\n'
			for (let i = 0; i < Math.min(referrers.length, 20); i++) {
				message += `#${i+1} ${userMention(referrers[i].userDiscordId)} with ${referrers[i].referredMembersCount} joiner(s) & ${referrers[i].referredMembersWhoLeftCount} left(s) - Score is ${referrers[i].referredMembersCount - referrers[i].referredMembersWhoLeftCount}\n`
			}
			//message += '--------------------------------------------------------- more 👇'
		}
					
		return message;
		
	};

export default topReferrersUI;