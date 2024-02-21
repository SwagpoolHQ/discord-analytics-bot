import { userMention, time } from 'discord.js';

	const topMembersReactionsUI = (usersCollection, number = 3) => {

		let message = '--';
		if( usersCollection.size > 0 ){

			message = ''
			for (const item of usersCollection.keys()){
				
				message += `${userMention(item)} reacted ${usersCollection.get(item).length} times\n`
			}
		}
		
		return message;
		
	};

export default topMembersReactionsUI;