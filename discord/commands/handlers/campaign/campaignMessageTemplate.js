import { hideLinkEmbed, userMention } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();


	const campaignMessageTemplate = ( campaignFromDb, botId ) => {

		const baseURL = process.env.NODE_ENV === 'development'
			? 'http://localhost:3000/invite' // LOCAL base URL 
			: `${process.env.PROD_URI}/invite` // PROD base URL

		let message = 'This campaign is paused\n';
		
		if( campaignFromDb.code ){

			message = `Name: ${ campaignFromDb.name } \n`
			message += `Description: ${ campaignFromDb.description } \n`
			message += '------------------------------------------------\n'
			message += `|    🔗 Copy and share this link \n`
			message += `|    ${ hideLinkEmbed( `${ baseURL }/${ campaignFromDb.code }` ) }\n`
			message += '------------------------------------------------\n'
			
		}

		if( botId ) {
			message += '--\n'
			message += `Powered by ${ userMention( botId ) }`
		}
		
		return message;
		
	};

export default campaignMessageTemplate;