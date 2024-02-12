const { ContextMenuCommandBuilder, ApplicationCommandType, time, Collection, EmbedBuilder, ChannelSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const topMembersReactionsUI = require('./message-stats/topMembersReactionsUI');
const getSwagpoolIconURL = require('../../imageURL/getSwagpoolIconURL');
const getMessageURL = require ('../../imageURL/getMessageURL')

module.exports = {
	cooldown: 5,
	data: new ContextMenuCommandBuilder()
		.setName('Message statistics')
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {

		await interaction.deferReply({ ephemeral: true }); // answers within the 3s. Displays: "thinking"
		
		// Fetch all reactions for a message
		const usersReactionsCollection = new Collection();
		const usersReactionsQuery = [];

		// Create an array of promises to fetch users for each reaction
		for (const reaction of interaction.targetMessage.reactions.cache.values()) {
			usersReactionsQuery.push( usersReactionsCollection.set(reaction._emoji.name, await reaction.users.fetch()) );
		}

		// Execute all the promises
		try {
			await Promise.all(usersReactionsQuery);
		} catch (error) {
			console.error(error);
		}

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
			content: 'Statistics for ' + getMessageURL(interaction.guild.id, interaction.targetMessage.channel.id, interaction.targetMessage.id) + '\n"' + interaction.targetMessage.content + '"',
			embeds: [usersReactions],
			components: [],
			ephemeral: true });

		},
};