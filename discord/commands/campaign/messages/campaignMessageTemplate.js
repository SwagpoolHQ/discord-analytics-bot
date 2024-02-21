import { hideLinkEmbed, userMention } from 'discord.js';
import baseURL from '../../../../utils/baseURL.js';

	const campaignMessageTemplate = ( campaignFromDb, botId ) => {

		let message = 'This campaign is paused\n';
		
		if( campaignFromDb.code ){

			message = `Name: ${ campaignFromDb.name } \n`
			message += `Description: ${ campaignFromDb.description } \n`
			message += '------------------------------------------------\n'
			message += `|    🔗 Copy and share this link \n`
			message += `|    ${ hideLinkEmbed( `${ baseURL }/invite/${ campaignFromDb.code }` ) }\n`
			message += '------------------------------------------------\n'
			
		}

		if( botId ) {
			message += '--\n'
			message += `Powered by ${ userMention( botId ) }`
		}
		
		return message;
		
	};

export default campaignMessageTemplate;