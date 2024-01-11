const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replies with your input!')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to echo back')
                .setRequired(true)
                .addChoices(
                    { name: 'Funny', value: 'gif_funny' },
                    { name: 'Meme', value: 'gif_meme' },
                    { name: 'Movie', value: 'gif_movie' },
                ))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to echo into'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) // sets the default permissions required for the command
        .setDMPermission(false), //remove the commands availability from DMs
	async execute(interaction) {
		const input = interaction.options.getString('input') ?? 'No choice found';
        const channel = interaction.options.getChannel('channel');
		await interaction.reply(`Selected ${channel}, input: ${input}`); // 3 seconds max to 1st response
	},
};