const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const wait = require('node:timers/promises').setTimeout;
const getGuildIconURL = require ('../../imageURL/getGuildIconURL');
const getSwagpoolIconURL = require('../../imageURL/getSwagpoolIconURL');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('campaigns')
		.setDescription("View campaigns' dashboard")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	    .setDMPermission(false)
        .addSubcommandGroup( subcommandgroup =>
            subcommandgroup
                .setName('top')
                .setDescription("View top campaigns' dashboard")
                .addSubcommand( subcommand =>
                    subcommand
                        .setName('traffic')
                        .setDescription("View top performing campaigns' dashboard")
                        .addStringOption( option =>
                            option
                                .setName('period')
                                .setDescription('Select a time period')
                                .addChoices(
                                    { name: 'Last 1D', value: '1' },
                                    { name: 'Last 7D', value: '7' },
                                    { name: 'Last 1M', value: '30' },
                                    { name: 'Last 3M', value: '90' },
                                )
                                .setRequired(true))
                        )  
            )
        ,
	async execute(interaction) {

        // Get the parameters
        const period = await interaction.options.getString('period') ?? { name: null } ;

        // Get the guild icon URL
        const guildIconURL = getGuildIconURL( interaction.guild.id, interaction.guild.icon );
        // Get the swagpool icon URL
        const swagpoolAvatarURL = getSwagpoolIconURL();

        if (interaction.options.getSubcommand() === 'traffic') {

            await interaction.reply(`Coming soon. You will be able to view your most active campaigns.`);

		}
	},
};