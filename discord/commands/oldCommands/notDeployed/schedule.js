import { ContextMenuCommandBuilder, ApplicationCommandType, time, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export const command = {
	cooldown: 5,
	data: new ContextMenuCommandBuilder()
		.setName('Schedule publication')
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {

		const selectDate = new StringSelectMenuBuilder()
			.setCustomId('date')
			.setPlaceholder('Select a date')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Bulbasaur')
					.setDescription('The dual-type Grass/Poison Seed Pokémon.')
					.setValue('bulbasaur'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Charmander')
					.setDescription('The Fire-type Lizard Pokémon.')
					.setValue('charmander'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Squirtle')
					.setDescription('The Water-type Tiny Turtle Pokémon.')
					.setValue('squirtle'),
			);

		const selectChannel = new ChannelSelectMenuBuilder()
			.setCustomId('channel')

		const schedule = new ButtonBuilder()
			.setCustomId('schedule')
			.setLabel('Schedule')
			.setStyle(ButtonStyle.Primary);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		
		const channelRow = new ActionRowBuilder()
			.addComponents(selectChannel);

		const dateRow = new ActionRowBuilder()
			.addComponents(selectDate);
		
		const buttonRow = new ActionRowBuilder()
			.addComponents(cancel, schedule);

		
		//const { channel } = interaction.targetMessage;
		console.log(interaction.targetMessage);
		
		const sentMessage = await interaction.reply({ 
			content: interaction.targetMessage.content,
			embeds: interaction.targetMessage.embeds,
			components: [channelRow,dateRow],
			ephemeral: true });

		//const sentMessage = await channel.send(`follow up message in ${channel.name}`)
		// Unicode emoji
		//sentMessage.react('👍');
		},
};