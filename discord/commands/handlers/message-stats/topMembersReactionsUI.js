const { userMention, time } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;


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

module.exports = topMembersReactionsUI;