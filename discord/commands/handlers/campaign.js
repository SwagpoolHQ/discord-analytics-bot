const { userMention, PermissionFlagsBits, ChannelType, SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');

const createCampaign = require('../../../mongodb/utils/createCampaign');
const getCampaigns = require('../../../mongodb/utils/getCampaigns');
const lastCampaignJoinersUI = require('./campaign/lastCampaignJoinersUI');
const getCampaignData = require('../../../mongodb/utils/getCampaignData');
const getCampaignInvites = require('../../../mongodb/utils/getCampaignInvites');
const createInviteForCampaign = require('../../../mongodb/utils/createInviteForCampaign');

const invitesListUI = require('./campaign/invitesListUI');
const newInviteUI = require('./campaign/newInviteUI');
const getGuildIconURL = require ('../../imageURL/getGuildIconURL');
const getSwagpoolIconURL = require('../../imageURL/getSwagpoolIconURL');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('campaign')
		.setDescription('Manage acquisition campaigns')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	    .setDMPermission(false)
        .addSubcommand( subcommand =>
			subcommand
                .setName('new')
				.setDescription("Create a new campaign")
                .addChannelOption( option =>
                    option
                        .setName('channel')
                        .setDescription('Select the onboarding channel')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption( option =>
                    option
                        .setName('name')
                        .setDescription('Set new campaign name')
                        .setRequired(true))
                )
        .addSubcommand( subcommand =>
			subcommand
                .setName('stats')
				.setDescription("View a campaign's stats")
                .addStringOption( option =>
                    option
                        .setName('name')
                        .setDescription('Select a campaign')
                        .setRequired(true)
                        .setAutocomplete(true))
                )
        ,
    async autocomplete(interaction) {
        // handle the autocompletion response
        const focusedValue = interaction.options.getFocused();
        const choices = await getCampaigns( interaction.guild.id );
        const filtered = choices.filter(choice => choice.name.startsWith(focusedValue)).slice(0, 25);
        await interaction.respond(
            filtered.map(choice => ({ name: choice.name, value: choice._id })),
        );
    },
	async execute(interaction) {

        await interaction.deferReply({ ephemeral: true }); // answers within the 3s. Displays: "thinking"

        // Get the guild icon URL
        const guildIconURL = getGuildIconURL( interaction.guild.id, interaction.guild.icon );
        // Get the swagpool icon URL
        const swagpoolAvatarURL = getSwagpoolIconURL();

        // Create the user referrals embed message
        const createCampaignAnalyticsEmbed = async (campaignData) => {
            const campaignAnalytics = new EmbedBuilder()
                .setColor('White')
                .setTitle(`${campaignData.campaign.name}`)
                //.setURL('https://discord.js.org/') // Go to web profile/referrals page
                .setAuthor({ 
                    name: interaction.guild.name, 
                    iconURL: guildIconURL, 
                    /*url: 'https://discord.js.org'*/ }) // Go to private channel chat for team members
                .setDescription(`Campaign stats\n\n-`)
                .setThumbnail( guildIconURL )
                .addFields(
                    { name: 'Today', value: `${campaignData.nbOfJoinersLast1d} joiners \n------------------\n${'--'} % DoD\n`, inline: true },
                    { name: 'This week', value: `${campaignData.nbOfJoinersLast7d} joiners \n------------------\n${'--'} % WoW\n`, inline: true },
                    { name: 'This month', value: `${campaignData.nbOfJoinersLast1m} joiners\n-----------------\n${'--'} % MoM\n`, inline: true },

                    { name: '\u200B', value: '\u200B' },
                    { name: `Last referrals (total: ${campaignData.nbOfJoiners})`, value: lastCampaignJoinersUI( campaignData.joiners , 15 ) },

                    { name: '\u200B', value: '\u200B' },
                )
                //.setImage('swagpoolAvatarURL') // Graph here
                .setTimestamp()
                .setFooter({ text: 'Powered by Swagpool', iconURL: swagpoolAvatarURL });

            return campaignAnalytics
        }

        // Create the buttons
        const addInviteButton = new ButtonBuilder()
            .setCustomId('add-invite')
            .setLabel('Add invite')
            .setStyle(ButtonStyle.Secondary);

        const getInvitesButton = new ButtonBuilder()
            .setCustomId('get-invites')
            .setLabel('View invites')
            .setStyle(ButtonStyle.Secondary);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Close')
            .setStyle(ButtonStyle.Secondary);

        const publishButton = new ButtonBuilder()
            .setCustomId('publish')
            .setLabel('Publish')
            .setStyle(ButtonStyle.Primary);

        // Create the buttons command row for campaign stats
        const campaignStatsButtonsRow = new ActionRowBuilder()
            .addComponents(cancelButton, addInviteButton, getInvitesButton, publishButton);


        // Create function to react to clicks
        const waitingForClick = async (messageSent) => {
            const collectorFilter = i => i.user.id === interaction.user.id;
            try {
                const clickedButton = await messageSent.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                let newMessageSent;
                if (clickedButton.customId === 'add-invite') {

                    const invite = await createInviteForCampaign( interaction.member , campaignData.campaign._id );
                    newMessageSent = await clickedButton.update({ 
                        content: `👌 ${campaignData.campaign.name} campaign\n${ newInviteUI( invite ) }`,
                        embeds: [campaignEmbed],
                        components: [campaignStatsButtonsRow],
                    });
                    await waitingForClick(newMessageSent);

                } else if (clickedButton.customId === 'get-invites') {

                    const invites = await getCampaignInvites( campaignData.campaign._id );
                    newMessageSent = await clickedButton.update({ 
                        content: `👌 ${campaignData.campaign.name} campaign\n${ invitesListUI( invites, 20) }`,
                        embeds: [campaignEmbed],
                        components: [campaignStatsButtonsRow],
                    });
                    await waitingForClick(newMessageSent);

                } else if (clickedButton.customId === 'publish') {

                    const channel = await interaction.client.channels.fetch(clickedButton.channelId);
                    // CREATE A WEBHOOK TO SEND MESSAGE AS THE USER --> https://discordjs.guide/popular-topics/webhooks.html#using-webhooks

                    await clickedButton.update({ 
                        content: `❤️ Thank you for using ${userMention(interaction.client.user.id)}`, 
                        embeds: [],
                        components: []
                    });
                    await channel.send({ 
                        content: `Sent by ${userMention(interaction.user.id)}`,
                        embeds: [campaignEmbed],
                        components: [],
                    });
                } else if (clickedButton.customId === 'cancel') {
                    newMessageSent = await clickedButton.update({ 
                        content: `❤️ Thank you for using ${userMention(interaction.client.user.id)}`,
                        embeds: [],
                        components: [] 
                    });
                }
            } catch (e) {
                await interaction.editReply({ content: `❤️ Thank you for using ${userMention(interaction.client.user.id)}\n💡 Buttons deactivate after 1 minute`,embeds: [campaignEmbed], components: [] });
            }
        };

        
        // Send 1st message based on command
        let messageSent;
        let campaignEmbed;
        let campaignData
        if (interaction.options.getSubcommand() === 'new') {

            // Get the parameters
            const campaignName = interaction.options.getString('name') ?? null;
            const channel = interaction.options.getChannel('channel') ?? null;

            const response = await createCampaign (interaction.member, campaignName, channel);

            if(response.status == 200){
                // Get the campaign data
                const campaignId = response.invite.campaign;
                campaignData = await getCampaignData( campaignId );
                campaignEmbed = await createCampaignAnalyticsEmbed( campaignData );

                messageSent = await interaction.editReply({ 
                    content: `👌 ${campaignData.campaign.name} campaign\n${ newInviteUI( response.invite ) }`,
                    embeds: [campaignEmbed],
                    components: [campaignStatsButtonsRow],
                }); // edit the 1st response message
                // Start listening to clicks
                await waitingForClick(messageSent);
            } else if (response.status == 500) {
                messageSent = await interaction.editReply({ 
                    content: response.message,
                    embeds: [],
                    components: [],
                }); // edit the 1st response message
            } else {
                messageSent = await interaction.editReply({ 
                    content: `an error happened `,
                    embeds: [],
                    components: [],
                }); // edit the 1st response message
            }
        } else if (interaction.options.getSubcommand() === 'stats') {

             // Get the parameters
            const campaignId = interaction.options.getString('name') ?? null;
            // Get the campaign data
            campaignData = await getCampaignData( campaignId );

            if ( campaignData ){
                campaignEmbed = await createCampaignAnalyticsEmbed( campaignData );
                messageSent = await interaction.editReply({ 
                    content: `💡 Support, install and feedback links are in ${userMention(interaction.client.user.id)}'s bio\n|`,
                    embeds: [campaignEmbed],
                    components: [campaignStatsButtonsRow],
                }); // edit the 1st response message

                // Start listening to clicks
                await waitingForClick(messageSent);

            } else {
                messageSent = await interaction.editReply({ 
                    content: `⚠️ This campaign doesn't seem to exist`,
                    embeds: [],
                    components: [],
                }); // edit the 1st response message
            }
        }
    },
};