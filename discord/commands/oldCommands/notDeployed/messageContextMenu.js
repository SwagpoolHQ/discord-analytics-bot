import { ContextMenuCommandBuilder, ApplicationCommandType, time } from 'discord.js';

export const command = {
	cooldown: 5,
	data: new ContextMenuCommandBuilder()
		.setName('Message Information')
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {
		
		const { channel } = interaction.targetMessage;
		//console.log(channel);
		
		await interaction.reply({ content: `This command was run by ${interaction.user.username}, who joined ${time(interaction.member.joinedAt, 'R')}.`, ephemeral: true });
		const sentMessage = await channel.send(`follow up message in ${channel.name}`)
		// Unicode emoji
		sentMessage.react('👍');
		},
};