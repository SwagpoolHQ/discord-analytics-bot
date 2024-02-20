import { 
    time, 
    userMention, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
} from 'discord.js';

import getMemberProfile from '../../../mongodb/utils/getMemberProfile.js';
import lastReferralsUI from './member/lastReferralsUI.js';
import getGuildIconURL from '../../imageURL/getGuildIconURL.js';
import getSwagpoolIconURL from '../../imageURL/getSwagpoolIconURL.js';
import discordToCreatedAtTimestamp from '../../../mongodb/utils/idConversion/discordToCreatedAtTimestamp.js';
import checkBotPermissions from '../../utils/checkBotPermissions.js';
import permissionsRequired from '../../config/permissionsRequired.js';

export const command = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('member')
		.setDescription('View members profiles and leaderboards')
        //.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	    .setDMPermission(false)
        .addSubcommand( subcommand =>
			subcommand
                .setName('profile')
				.setDescription("View a member's profile")
                .addUserOption( option =>
                    option
                        .setName('member')
                        .setDescription('Select member by name')
                        .setRequired(true))
                )
        .addSubcommand( subcommand =>
			subcommand
                .setName('referrals')
				.setDescription("View a member's referrals")
                .addUserOption( option =>
                    option
                        .setName('member')
                        .setDescription('Select member by name')
                        .setRequired(true))
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

        // Get the parameters
        const user = interaction.options.getUser('member') ?? 'No <user filter> found';
        const member = interaction.options.getMember('member') ?? 'No <member filter> found';

        if (user) {

            // Get the members data
            const memberProfile = await getMemberProfile( interaction.guild.id, user.id);

            const memberAccountCreationTimestamp = discordToCreatedAtTimestamp( memberProfile.user?.discordId );
            let memberAccountAgeInDays = '--';
            if ( memberProfile?.joinedAtTimestamp && memberAccountCreationTimestamp ){
                memberAccountAgeInDays = (memberProfile?.joinedAtTimestamp - memberAccountCreationTimestamp) / ( 1000 * 60 * 60 * 24 ); 
                memberAccountAgeInDays= memberAccountAgeInDays.toFixed(0)
            }

            // Get the guild icon URL
            const guildIconURL = getGuildIconURL( interaction.guild.id, interaction.guild.icon );
            // Get the avatar URL
            const userAvatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 });
            // Get the swagpool icon URL
            const swagpoolAvatarURL = getSwagpoolIconURL();
            
            // Create the member profile embed message
            const userProfile = new EmbedBuilder()
                .setColor('White')
                .setTitle(`${user.username}`)
                //.setURL('https://discord.js.org/') // Go to web profile page
                .setAuthor({ 
                    name: interaction.guild.name, 
                    iconURL: guildIconURL, 
                    /*url: 'https://discord.js.org'*/ }) // Go to private channel chat for team members
                .setDescription(`Profile\n\n-`)
                .setThumbnail( userAvatarURL )
                .addFields(
                    { name: 'Today', value: `${memberProfile.nbOfMessagesLast1d} msg \n------------------\n${'--'} % DoD\n`, inline: true },
                    { name: 'This week', value: `${memberProfile.nbOfMessagesLast7d} msg \n------------------\n${'--'} % WoW\n`, inline: true },
                    { name: 'This month', value: `${memberProfile.nbOfMessagesLast1m} msg \n------------------\n${'--'} % MoM\n`, inline: true },

                    { name: '\u200B', value: '\u200B' },
                    { name: `Last referrals (total: ${memberProfile.nbOfReferrals})`, value: lastReferralsUI( memberProfile.referrals , 3 ) },

                    { name: '\u200B', value: '\u200B' },

                    { name: `Join date`, value: `${memberProfile?.joinedAtTimestamp ? time(memberProfile?.joinedAtTimestamp,'R') : '--'}`, inline: true },
                    { name: 'Account was', value: `${memberAccountAgeInDays} days old`, inline: true },

                    { name: '\u200B', value: '\u200B' },

                    { name: 'Referred by', value: `${memberProfile?.referrer?.discordId ? userMention(memberProfile?.referrer?.discordId) : '--'}`, inline: true }, 
                    { name: 'Campaign was', value: `${memberProfile?.campaign?.name ? memberProfile?.campaign?.name : '--' }` , inline: true},
                    
                    { name: '\u200B', value: '\u200B' },
                )
                //.setImage('swagpoolAvatarURL') // Graph here
                .setTimestamp()
                .setFooter({ text: 'Powered by Swagpool', iconURL: swagpoolAvatarURL });

            // Create the user referrals embed message
            const userReferrals = new EmbedBuilder()
                .setColor('White')
                .setTitle(`${user.username}`)
                //.setURL('https://discord.js.org/') // Go to web profile/referrals page
                .setAuthor({ 
                    name: interaction.guild.name, 
                    iconURL: guildIconURL, 
                    /*url: 'https://discord.js.org'*/ }) // Go to private channel chat for team members
                .setDescription(`Referrals\n\n-`)
                .setThumbnail( userAvatarURL )
                .addFields(
                    { name: 'Today', value: `${memberProfile.nbOfReferralsLast1d} joiners \n------------------\n${'--'} % DoD\n`, inline: true },
                    { name: 'This week', value: `${memberProfile.nbOfReferralsLast7d} joiners \n------------------\n${'--'} % WoW\n`, inline: true },
                    { name: 'This month', value: `${memberProfile.nbOfReferralsLast1m} joiners\n-----------------\n${'--'} % MoM\n`, inline: true },

                    { name: '\u200B', value: '\u200B' },
                    { name: `Last referrals (total: ${memberProfile.nbOfReferrals})`, value: lastReferralsUI( memberProfile.referrals , 15 ) },

                    { name: '\u200B', value: '\u200B' },

                )
                //.setImage('swagpoolAvatarURL') // Graph here
                .setTimestamp()
                .setFooter({ text: 'Powered by Swagpool', iconURL: swagpoolAvatarURL });

            // Create the buttons
            const referralsButton = new ButtonBuilder()
                .setCustomId('referrals')
                .setLabel('All referrals')
                .setStyle(ButtonStyle.Primary);

            const profileButton = new ButtonBuilder()
                .setCustomId('profile')
                .setLabel('View profile')
                .setStyle(ButtonStyle.Primary);
    
            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Close')
                .setStyle(ButtonStyle.Secondary);

            const publishButton = new ButtonBuilder()
                .setCustomId('publish')
                .setLabel('Publish')
                .setStyle(ButtonStyle.Primary);

            // Create the buttons command row for the member profile
            const profileButtonsRow = new ActionRowBuilder()
                .addComponents(cancelButton, referralsButton, publishButton);

            // Create the buttons command row for the member referrals
            const referralsButtonsRow = new ActionRowBuilder()
                .addComponents(cancelButton, profileButton, publishButton);

            // Send 1st message based on command
            let messageSent;
            let activeEmbed;
            if (interaction.options.getSubcommand() === 'profile') {

                activeEmbed = userProfile;
                
                messageSent = await interaction.editReply({ 
                    content: `💡 Support, install and feedback links are in ${userMention(interaction.client.user.id)}'s bio\n${warningMessage}|`,
                    embeds: [activeEmbed],
                    components: [profileButtonsRow],
                    ephemeral: true,
                }); // edit the 1st response message

            } else if (interaction.options.getSubcommand() === 'referrals') {

                activeEmbed = userReferrals;

                messageSent = await interaction.editReply({ 
                    content: `💡 Support, install and feedback links are in ${userMention(interaction.client.user.id)}'s bio\n${warningMessage}|`,
                    embeds: [activeEmbed],
                    components: [referralsButtonsRow],
                    ephemeral: true,
                }); // edit the 1st response message
            }

            // Create function to react to clicks
            const waitingForClick = async (messageSent) => {
                const collectorFilter = i => i.user.id === interaction.user.id;
                try {
                    const clickedButton = await messageSent.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                    let newMessageSent;
                    if (clickedButton.customId === 'referrals') {
                        activeEmbed = userReferrals;
                        newMessageSent = await clickedButton.update({ 
                            content: `💡 Support, install and feedback links are in ${userMention(interaction.client.user.id)}'s bio\n${warningMessage}|`,
                            embeds: [activeEmbed],
                            components: [referralsButtonsRow],
                        });
                        await waitingForClick(newMessageSent);
                    } else if (clickedButton.customId === 'profile') {
                        activeEmbed = userProfile;
                        newMessageSent = await clickedButton.update({ 
                            content: `💡 Support, install and feedback links are in ${userMention(interaction.client.user.id)}'s bio\n${warningMessage}|`, 
                            embeds: [activeEmbed],
                            components: [profileButtonsRow],
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
                            embeds: [activeEmbed],
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
                    await interaction.editReply({ content: `❤️ Thank you for using ${userMention(interaction.client.user.id)}\n💡 Buttons deactivate after 1 minute`,embeds: [activeEmbed], components: [] });
                }
            }
        
            // Start listening to clicks
            await waitingForClick(messageSent);

        } else {
            await interaction.editReply(`No member selected. Try again`);
        }
	},
};