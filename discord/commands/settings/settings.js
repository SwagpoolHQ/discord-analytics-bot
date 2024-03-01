import { 
    SlashCommandBuilder,  
    ChannelType,
    PermissionFlagsBits,
    channelMention,
} from 'discord.js';

import Guild from '../../../mongodb/models/guilds.js';
import discordToMongoId from '../../../mongodb/utils/idConversion/discordToMongoId.js';

import getGuildIconURL from '../../utils/getGuildIconURL.js';
import getSwagpoolIconURL from '../../utils/getSwagpoolIconURL.js';
import checkBotPermissions from '../../utils/checkBotPermissions.js';
import permissionsRequired from '../../config/permissionsRequired.js';

export const command = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription("Set the bot config for your guild")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	    .setDMPermission(false)
        .addSubcommandGroup( subcommandgroup =>
            subcommandgroup
                .setName('onboarding')
                .setDescription("Set your guild's onboarding channel")
                .addSubcommand( subcommand =>
                    subcommand
                        .setName('channel')
                        .setDescription("Set your guild's onboarding channel")
                        .addChannelOption( option =>
                            option
                                .setName('channel')
                                .setDescription('Select the onboarding channel')
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(true)))
            )
        .addSubcommandGroup( subcommandgroup =>
            subcommandgroup
                .setName('google')
                .setDescription("Set your Google Analytics config")          
                .addSubcommand( subcommand =>
                    subcommand
                        .setName('analytics')
                        .setDescription("Set your Google Analytics config")
                        .addStringOption( option =>
                            option
                                .setName('tag-id')
                                .setDescription('Set you GA tag-id')
                                .setRequired(true)
                                )
                        .addStringOption( option =>
                            option
                                .setName('api-secret')
                                .setDescription('Set you GA api-secret')
                                .setRequired(true)
                                )
                )
            )
        ,
	async execute(interaction) {

        // Checking bot permissions to track invites
        const permissionsCheck = checkBotPermissions( interaction.guild, permissionsRequired.inviteTracker);
        let warningMessage = '';
        if( !permissionsCheck.result) {
            warningMessage=`WARNING: [${permissionsCheck.missing}] permissions are missing to track joiners.\n Campaigns have been switched to authentication required mode\n Referrals are not tracked`;
        };

        await interaction.deferReply({ ephemeral: true }); // answers within the 3s. Displays: "thinking" 

        // Get the guild icon URL
        const guildIconURL = getGuildIconURL( interaction.guild.id, interaction.guild.icon );
        // Get the swagpool icon URL
        const swagpoolAvatarURL = getSwagpoolIconURL();

        // Send 1st message based on command
        let messageSent;
        
        if (interaction.options.getSubcommand() === 'channel') {

             // Get the parameters
             const channel = interaction.options.getChannel('channel') ?? null;

            // UPDATE ONBOARDING CHANNEL IN DB
            if (channel){
                const guildUpdate = await Guild.updateOne(
                    { _id: discordToMongoId(interaction.guild.id) },
                    { channel: discordToMongoId(channel.id) }
                );

                if (guildUpdate?.modifiedCount) {

                    interaction.editReply({
                        content: `✅ ${interaction.guild.name} onboarding channel is now : ${channelMention(channel.id)}`,
                        embeds: [ ],
                        components: [ ],
                    }); // edit the 1st response message
                    return

                } else {
                    interaction.editReply({
                        content: "⚠️ Error - Onboarding channel was not updated",
                    }); // edit the 1st response message
                    return
                }
            } else {
                interaction.editReply({
                    content: "⚠️ Error - Onboarding channel was not updated",
                }); // edit the 1st response message
                return
            }
		} else if (interaction.options.getSubcommand() === 'analytics') {

            // Get the parameters
            const gaTag = interaction.options.getString('tag-id') ?? null;
            const apiSecret = interaction.options.getString('api-secret') ?? null;
            const apiSecretMasked = apiSecret ? `${apiSecret.slice(0, 2)}...${apiSecret.slice(-3)}` : null;
            
            /// UPDATE ONBOARDING CHANNEL IN DB
            if (gaTag && apiSecret){
                const guildUpdate = await Guild.updateOne(
                    { _id: discordToMongoId(interaction.guild.id) },
                    { gaTag, gaApiKey: apiSecret }
                );

                if (guildUpdate?.modifiedCount) {

                    interaction.editReply({
                        content: `✅ Google Analytics config for ${interaction.guild.name} updated. ga-tag: ${gaTag} - api-secret: ${apiSecretMasked}`,
                        embeds: [ ],
                        components: [ ],
                    }); // edit the 1st response message
                    return

                } else {
                    interaction.editReply({
                        content: "⚠️ Error - Onboarding channel was not updated",
                    }); // edit the 1st response message
                    return
                }
            } else {
                interaction.editReply({
                    content: "⚠️ Error - Onboarding channel was not updated",
                }); // edit the 1st response message
                return
            }
		} else {
            await interaction.editReply(`Weird command.`);
		}
    },
};