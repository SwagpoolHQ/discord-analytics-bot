const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const discordToCreatedAtTimestamp = require('../../../../mongodb/utils/idConversion/discordToCreatedAtTimestamp');

module.exports = {
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
