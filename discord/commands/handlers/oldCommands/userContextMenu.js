import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import discordToCreatedAtTimestamp from '../../../../mongodb/utils/idConversion/discordToCreatedAtTimestamp';

export const command = {
	cooldown: 5,
	data: new ContextMenuCommandBuilder()
		.setName('User Information')
		.setType(ApplicationCommandType.User),
	async execute(interaction) {
		
		const { username, id } = interaction.targetUser;
		discordToCreatedAtTimestamp(id);
		console.log(username);
		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
	},
};
