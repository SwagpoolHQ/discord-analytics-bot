import { SlashCommandBuilder } from 'discord.js';
import wait from ('node:timers/promises').setTimeout;

export const command = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		//await interaction.reply('Pong!'); // 3 seconds max to 1st response
		await interaction.deferReply(); // answers within the 3s. Displays: "thinking" 
		await wait(2_000);
		await interaction.followUp('Pong again!'); // 15min max to edit response
		await wait(2_000);
		await interaction.followUp('Pong again again!'); // 15min max to edit response
		await wait(2_000);
		await interaction.editReply('Pong Pong!'); // edit the 1st response message
		const message = await interaction.fetchReply(); // get the response message to react or else
		await wait(2_000);
		await interaction.deleteReply(); // deletes the 1st response Message
	},
};