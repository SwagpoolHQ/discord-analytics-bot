import { userMention } from 'discord.js';

	const campaignsList = (campaigns) => {

		let message = '--';
		if( campaigns[0] ){

			// TO CLEAN BY ADDING SCORE FIELD & SORT IN THE DB QUERY 
			campaigns.sort( (a,b) => (b.referredMembersCount - b.referredMembersWhoLeftCount)- (a.referredMembersCount - a.referredMembersWhoLeftCount));

			message = '\n'
			for (let i = 0; i < Math.min(campaigns.length, 20); i++) {
				message += `#${i+1} | ${campaigns[i].name} - ${campaigns[i].referredMembersCount - campaigns[i].referredMembersWhoLeftCount} members(s)\n ---|    ${campaigns[i].referredMembersCount} joiner(s) - ${campaigns[i].referredMembersWhoLeftCount} leaver(s)\n`
			}
			//message += '--------------------------------------------------------- more 👇'
		}
					
		return message;
		
	};

export default campaignsList;