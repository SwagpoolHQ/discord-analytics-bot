import { SlashCommandBuilder } from 'discord.js';
import getInviters from '../../../../mongodb/utils/getReferrers';
import wait from ('node:timers/promises').setTimeout;

export const command = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('inviters')
		.setDescription('View inviters leaderboard'),
	async execute(interaction) {

		await interaction.deferReply(); // answers within the 3s. Displays: "thinking" 

        const inviters = await getInviters( interaction.guild.id );

		let discordMessage = '';
		for (let inviter of inviters){
			discordMessage += `${inviter.username}: ${inviter.referredMembersCount} invited, ${inviter.referredMembersWhoLeftCount} left \n`
		}

		console.log('displayMessage : /n',discordMessage);

		await wait(4_000);
		await interaction.editReply(discordMessage); // 15min max to edit response
		
	},
};