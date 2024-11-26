import {
    time,
    userMention,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
} from 'discord.js';

import getGuildIconURL from '../../utils/getGuildIconURL.js';
import getSwagpoolIconURL from '../../utils/getSwagpoolIconURL.js';
import checkBotPermissions from '../../utils/checkBotPermissions.js';
import permissionsRequired from '../../config/permissionsRequired.js';
import getCampaignsData from '../../../mongodb/utils/getCampaignsData.js';
import campaignsList from './messages/campaignsList.js';
import debug from 'debug';

const commandChoices = [
    { name: 'Last 1D', value: '1' },
    { name: 'Last 7D', value: '7' },
    { name: 'Last 1M', value: '30' },
    { name: 'Last 3M', value: '90' },
];

export const command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('campaigns')
        .setDescription("View campaigns' dashboard")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommandGroup(subcommandgroup =>
            subcommandgroup
                .setName('top')
                .setDescription("View top campaigns' dashboard")
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('traffic')
                        .setDescription("View top performing campaigns' dashboard")
                        .addStringOption(option =>
                            option
                                .setName('period')
                                .setDescription('Select a time period')
                                .addChoices(...commandChoices)
                                .setRequired(true))
                )
        )
    ,
    async execute(interaction) {

        // Checking bot permissions to track invites
        const permissionsCheck = checkBotPermissions(interaction.guild, permissionsRequired.inviteTracker);
        let warningMessage = '';
        if (!permissionsCheck.result) {
            warningMessage = `WARNING: [${permissionsCheck.missing}] permissions are missing to track joiners.\n Campaigns have been switched to authentication required mode\n Referrals are not tracked`;
        };

        await interaction.deferReply({ ephemeral: true }); // answers within the 3s. Displays: "thinking" 

        // Get the parameters
        const period = await interaction.options.getString('period') ?? { name: null };
        // Get the guild icon URL
        const guildIconURL = getGuildIconURL(interaction.guild.id, interaction.guild.icon);
        // Get the swagpool icon URL
        const swagpoolAvatarURL = getSwagpoolIconURL();

        // Create function to create the top campaigns leaderboard's embed message
        const campaignsLeaderboard = async (periodNbOfDays) => {

            const periodName = commandChoices.find(item => item.value == periodNbOfDays).name;
            const periodWindow = commandChoices.find(item => item.value == periodNbOfDays).value; // Make sure periodWindow is one of predefined values (avoid injections)

            // Computing the start & end timestamps for the required period
            const endTimestamp = new Date().getTime(); // this is now
            const startTimestamp = endTimestamp - periodWindow * 24 * 60 * 60 * 1000; // The last "period" days in millisecondes from now.
            // Convert the startTimestamp to a Date object
            const startDate = new Date(startTimestamp);
            ////
            // get the acquisitionPeriod data
            const acquisitionPeriod = await getCampaignsData(interaction.guild.id, startTimestamp, endTimestamp);
            console.log('acquisitionPeriod', acquisitionPeriod);
            const averageAcquisition = acquisitionPeriod.totalCampaigns ? (acquisitionPeriod.totalJoiners / acquisitionPeriod.totalCampaigns).toFixed(1) : '--';
            //console.log('acquisitionPeriod', acquisitionPeriod );
            ////

            // Create the user profile embed message
            const campaignsLeaderboardEmbed = new EmbedBuilder()
                .setColor('White')
                .setTitle(`Top campaigns`)
                //.setURL('https://discord.js.org/') // Go to web profile page
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL: guildIconURL,
                    /*url: 'https://discord.js.org'*/
                }) // Go to private channel chat for team members
                .setDescription(`${periodName} period ( started ${time(startDate, 'd')} ) \n\n-`)
                .setThumbnail(guildIconURL)
                .addFields(
                    { name: 'Campaigns', value: `${acquisitionPeriod.totalCampaigns}\n------------------\n`, inline: true },
                    { name: 'Joiners', value: `${acquisitionPeriod.totalJoiners}\n------------------\n`, inline: true },
                    { name: 'Average', value: `${averageAcquisition}\n------------------\n`, inline: true },

                    { name: '\u200B', value: '\u200B' },
                    { name: `Top campaigns`, value: campaignsList(acquisitionPeriod.campaigns) },

                    { name: '\u200B', value: '\u200B' },
                )
                //.setImage('swagpoolAvatarURL') // Graph here
                .setTimestamp()
                .setFooter({ text: 'Powered by Swagpool', iconURL: swagpoolAvatarURL });

            return campaignsLeaderboardEmbed
        }

        // Create the buttons
        const last1dButton = new ButtonBuilder()
            .setCustomId('1')
            .setLabel('1D')
            .setStyle(ButtonStyle.Secondary);

        const last7dButton = new ButtonBuilder()
            .setCustomId('7')
            .setLabel('7D')
            .setStyle(ButtonStyle.Secondary);

        const last1mButton = new ButtonBuilder()
            .setCustomId('30')
            .setLabel('1M')
            .setStyle(ButtonStyle.Secondary);

        const last3mButton = new ButtonBuilder()
            .setCustomId('90')
            .setLabel('3M')
            .setStyle(ButtonStyle.Secondary);

        const publishButton = new ButtonBuilder()
            .setCustomId('publish')
            .setLabel('Publish')
            .setStyle(ButtonStyle.Primary);

        // Create function to create the buttons command row the active period
        const actionRow = async (period) => {
            period === '1' ? last1dButton.setDisabled(true) : last1dButton.setDisabled(false);
            period === '7' ? last7dButton.setDisabled(true) : last7dButton.setDisabled(false);
            period === '30' ? last1mButton.setDisabled(true) : last1mButton.setDisabled(false);
            period === '90' ? last3mButton.setDisabled(true) : last3mButton.setDisabled(false);

            const actionRow = new ActionRowBuilder()
                .addComponents(last1dButton, last7dButton, last1mButton, last3mButton, publishButton);

            return actionRow;
        }

        // Create function to react to clicks
        const waitingForClick = async (messageSent) => {
            const collectorFilter = i => i.user.id === interaction.user.id;
            try {
                const clickedButton = await messageSent.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                let newMessageSent;
                if (clickedButton.customId === 'publish') {

                    const channel = await interaction.client.channels.fetch(clickedButton.channelId);
                    // CREATE A WEBHOOK TO SEND MESSAGE AS THE USER --> https://discordjs.guide/popular-topics/webhooks.html#using-webhooks

                    await clickedButton.update({
                        content: `❤️ Thank you for using ${userMention(interaction.client.user.id)}`,
                        embeds: [],
                        components: []
                    });
                    await channel.send({
                        content: `Sent by ${userMention(interaction.user.id)}`,
                        embeds: [activeEmbed],
                        components: [],
                    });
                } else {
                    activeEmbed = await campaignsLeaderboard(clickedButton.customId);
                    newMessageSent = await clickedButton.update({
                        content: `⚡️ Powered by ${userMention(interaction.client.user.id)}\n${warningMessage}|`,
                        embeds: [activeEmbed],
                        components: [await actionRow(clickedButton.customId)],
                    });
                    await waitingForClick(newMessageSent);
                }
            } catch (e) {
                await interaction.editReply({ content: `❤️ Thank you for using ${userMention(interaction.client.user.id)}\n💡 Buttons deactivate after 1 minute`, embeds: [activeEmbed], components: [] });
            }
        }

        // Send 1st message based on command
        let messageSent;
        let activeEmbed;
        if (interaction.options.getSubcommand() === 'traffic') {
            activeEmbed = await campaignsLeaderboard(period);
            messageSent = await interaction.editReply({
                content: `⚡️ Powered by ${userMention(interaction.client.user.id)}\n${warningMessage}|`,
                embeds: [activeEmbed],
                components: [await actionRow(period)],
            }); // edit the 1st response message

            // Start listening to clicks
            await waitingForClick(messageSent);

        } else {
            await interaction.editReply(`Weird command.`);
        }
    },
};