//const { time, userMention, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
import {
    time, 
    userMention, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits 
} from 'discord.js';

//const getReferrers = require ('../../../mongodb/utils/getReferrers');
import getReferrers from '../../../mongodb/utils/getReferrers.js';
//const topReferrersUI = require ('./leaderboard/topReferrersUI.js');
import topReferrersUI from './leaderboard/topReferrersUI.js';
//const getGuildIconURL = require ('../../imageURL/getGuildIconURL');
import getGuildIconURL from '../../imageURL/getGuildIconURL.js';
//const getSwagpoolIconURL = require('../../imageURL/getSwagpoolIconURL');
import getSwagpoolIconURL from '../../imageURL/getSwagpoolIconURL.js';

//const checkBotPermissions = require('../../utils/checkBotPermissions');
import checkBotPermissions from '../../utils/checkBotPermissions.js';
//const permissionsRequired = require('../../config/permissionsRequired');
import permissionsRequired from '../../config/permissionsRequired.js';

const commandChoices = [
        { name: 'Last 1D', value: '1' },
        { name: 'Last 7D', value: '7' },
        { name: 'Last 1M', value: '30' },
        { name: 'Last 3M', value: '90' },
    ];

export const command = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('members')
		.setDescription('View community leaderboards')
        //.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	    .setDMPermission(false)
        .addSubcommandGroup( subcommandgroup =>
            subcommandgroup
                .setName('top')
                .setDescription('select leaderboard')
                .addSubcommand( subcommand =>
                    subcommand
                        .setName('referrers')
                        .setDescription('View referrals leaderboard')
                        .addStringOption( option =>
                            option
                                .setName('period')
                                .setDescription('Select a time period')
                                .addChoices( ...commandChoices )
                                .setRequired(true))
                        )
                .addSubcommand( subcommand =>
                    subcommand
                        .setName('contributors')
                        .setDescription('View contributions leaderboard')
                        .addStringOption( option =>
                            option
                                .setName('period')
                                .setDescription('Select a time period')
                                .addChoices( ...commandChoices )
                                .setRequired(true))
                        )  
            )
        ,
	async execute(interaction) {

        // Checking bot permissions to track invites
        const permissionsCheck = checkBotPermissions( interaction.guild, permissionsRequired.inviteTracker);
        let warningMessage = '';
        if( !permissionsCheck.result) {
            warningMessage=`WARNING: [${permissionsCheck.missing}] permissions are missing to track member referrals.\n`;
        };

        await interaction.deferReply({ ephemeral: true }); // answers within the 3s. Displays: "thinking" 

        // Get the period parameter
        let period = await interaction.options.getString('period') ?? null ;
        // Get the guild icon URL
        const guildIconURL = getGuildIconURL( interaction.guild.id, interaction.guild.icon );
        // Get the swagpool icon URL
        const swagpoolAvatarURL = getSwagpoolIconURL();

        // Create function to create the user profile embed message
        const leaderboardForReferrals = async (periodNbOfDays) => {

            const periodName = commandChoices.find( item => item.value == periodNbOfDays ).name;

            // Computing the start & end timestamps for the required period
            const endTimestamp = new Date().getTime(); // this is now
            const startTimestamp  = endTimestamp - periodNbOfDays * 24 * 60 * 60 * 1000; // The last "period" days in millisecondes from now.
            // Convert the startTimestamp to a Date object
            const startDate = new Date( startTimestamp );

            // get the referralPeriod data
            const referralPeriod = await getReferrers( interaction.guild.id, startTimestamp, endTimestamp );
            const averageReferrals = referralPeriod.totalReferrers ? (referralPeriod.totalJoiners / referralPeriod.totalReferrers).toFixed(1) : '--';

            //console.log('referralPeriod', referralPeriod );

            // Create the user profile embed message
            const leaderboardForReferralsEmbed = new EmbedBuilder()
                .setColor('White')
                .setTitle(`Top referrers leaderboard`)
                //.setURL('https://discord.js.org/') // Go to web profile page
                .setAuthor({ 
                    name: interaction.guild.name, 
                    iconURL: guildIconURL, 
                    /*url: 'https://discord.js.org'*/ }) // Go to private channel chat for team members
                .setDescription(`${periodName} period ( started ${time(startDate, 'd')} ) \n\n-`)
                .setThumbnail( guildIconURL )
                .addFields(
                    { name: 'Players', value: `${referralPeriod.totalReferrers}\n------------------\n`, inline: true },
                    { name: 'Joiners', value: `${referralPeriod.totalJoiners}\n------------------\n`, inline: true },
                    { name: 'Average', value: `${averageReferrals}\n------------------\n`, inline: true },

                    { name: '\u200B', value: '\u200B' },
                    { name: `Top referrers`, value: topReferrersUI(referralPeriod.referrers) },

                    { name: '\u200B', value: '\u200B' },
                )
                //.setImage('swagpoolAvatarURL') // Graph here
                .setTimestamp()
                .setFooter({ text: 'Powered by Swagpool', iconURL: swagpoolAvatarURL });

            return leaderboardForReferralsEmbed
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
            period == '1' ? last1dButton.setDisabled(true) : last1dButton.setDisabled(false);
            period == '7' ? last7dButton.setDisabled(true) : last7dButton.setDisabled(false);
            period == '30' ? last1mButton.setDisabled(true) : last1mButton.setDisabled(false);
            period == '90' ? last3mButton.setDisabled(true) : last3mButton.setDisabled(false);

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
                    activeEmbed =  await leaderboardForReferrals(clickedButton.customId);
                    newMessageSent = await clickedButton.update({ 
                        content: `💡 Support, install and feedback links are in ${userMention(interaction.client.user.id)}'s bio\n${warningMessage}|`,
                        embeds: [ activeEmbed ],
                        components: [ await actionRow(clickedButton.customId) ],
                    });
                    await waitingForClick(newMessageSent);
                } 
            } catch (e) {
                await interaction.editReply({ content: `❤️ Thank you for using ${userMention(interaction.client.user.id)}\n💡 Buttons deactivate after 1 minute`,embeds: [activeEmbed], components: [] });
            }
        }

        // Send 1st message based on command
        let messageSent;
        let activeEmbed;
        if (interaction.options.getSubcommand() === 'referrers') {
            activeEmbed =  await leaderboardForReferrals(period);
            messageSent = await interaction.editReply({
                content: `💡 Support, install and feedback links are in ${userMention(interaction.client.user.id)}'s bio\n${warningMessage}|`,
                embeds: [ activeEmbed ],
                components: [ await actionRow(period) ],
            }); // edit the 1st response message

            // Start listening to clicks
            await waitingForClick(messageSent);

		} else if (interaction.options.getSubcommand() === 'contributors') {
            await interaction.editReply(`Coming soon. You will be able to view the top contributors leaderboard.`);
		}
	},
};