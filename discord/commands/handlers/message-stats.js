const { ContextMenuCommandBuilder, ApplicationCommandType, time, Collection, EmbedBuilder, ChannelSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const topMembersReactionsUI = require('./message-stats/topMembersReactionsUI');
const getSwagpoolIconURL = require('../../imageURL/getSwagpoolIconURL');
const getMessageURL = require ('../../imageURL/getMessageURL');

const checkBotPermissions = require('../../utils/checkBotPermissions');
const permissionsRequired = require('../../config/permissionsRequired');

module.exports = {
	cooldown: 5,
	data: new ContextMenuCommandBuilder()
		.setName('Message statistics')
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {

		// Checking bot permissions to access reactions
		const permissionsCheck = checkBotPermissions( interaction.guild, permissionsRequired.messageStats);
		let warningMessage = '';
		if( !permissionsCheck.result) {
			warningMessage=``;
		};

		await interaction.deferReply({ ephemeral: true }); // answers within the 3s. Displays: "thinking"
		
		// Fetch all reactions for a message
		const usersReactionsCollection = new Collection();
		const usersReactionsQuery = [];

		// Create an array of promises to fetch users for each reaction
		for (const reaction of interaction.targetMessage.reactions.cache.values()) {
				try {
					usersReactionsCollection.set(reaction._emoji.name, await reaction.users.fetch())
				} catch (error) {
					console.error(`ERROR: ${interaction.guild.name} | message-stats not working in channel: "${interaction.channel.name}"`);
					interaction.editReply({ 
						content: `⚠️ Invite bot in channel to view message stats`,
						embeds: [],
						components: [],
						ephemeral: true });
					return
				}
		};

		// List reactions per User in new Collection
		const usersCollection = new Collection();
		for (const [reaction, reactionUsers] of usersReactionsCollection){
			reactionUsers.forEach( (user) => {				
				if (usersCollection.has(user.id)){
					usersCollection.set(user.id, [ ...usersCollection.get(user.id), reaction ])
				} else {
					usersCollection.set(user.id, [ reaction ])
				}
			});
		}


 		// Create the user reactions embed message

			// Get the swagpool icon URL
			const swagpoolAvatarURL = getSwagpoolIconURL();

		 const usersReactions = new EmbedBuilder()
		 .setColor('White')
		 .setTitle(`${usersCollection.size} members reacted`)
		 .addFields(
			 { name: '\u200B', value: topMembersReactionsUI( usersCollection , 15 ) },
			 { name: '\u200B', value: '\u200B' },
		 )
		 .setTimestamp()
		 .setFooter({ text: 'Powered by Swagpool', iconURL: swagpoolAvatarURL });

		// Send the result
		const sentMessage = await interaction.editReply({ 
			content: `${warningMessage} Statistics for ${getMessageURL(interaction.guild.id, interaction.targetMessage.channel.id, interaction.targetMessage.id)}\n"${interaction.targetMessage.content}"`,
			embeds: [usersReactions],
			components: [],
			ephemeral: true });
		},
};