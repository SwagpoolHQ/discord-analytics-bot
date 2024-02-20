import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import getGuildIconURL from '../../imageURL/getGuildIconURL.js';
import getSwagpoolIconURL from '../../imageURL/getSwagpoolIconURL.js';
import checkBotPermissions from '../../utils/checkBotPermissions.js';
import permissionsRequired from '../../config/permissionsRequired.js';

export const command = {
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

        // Checking bot permissions to track invites
        const permissionsCheck = checkBotPermissions( interaction.guild, permissionsRequired.inviteTracker);
        if( !permissionsCheck.result) {

            interaction.reply({ 
                content: `WARNING: [${permissionsCheck.missing}] permissions are missing to track campaigns.`,
                embeds: [],
                components: [],
                ephemeral: true,
            });

        } else {

            // Get the parameters
            const period = await interaction.options.getString('period') ?? { name: null } ;

            // Get the guild icon URL
            const guildIconURL = getGuildIconURL( interaction.guild.id, interaction.guild.icon );
            // Get the swagpool icon URL
            const swagpoolAvatarURL = getSwagpoolIconURL();

            if (interaction.options.getSubcommand() === 'traffic') {

                await interaction.reply(`Coming soon. You will be able to view your most active campaigns.`);

            }
        }
	},
};