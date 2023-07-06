const { SlashCommandBuilder } = require('discord.js');
const { Assignable } = require('../models/assignable');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('listranks')
		.setDescription('Replies with a list of ranks and their associated rank points for the given category!')
		.addStringOption(option =>
			option.setName('category')
			.setDescription('The name of the category you are creating.')
			.setRequired(true)),
	async execute(interaction) {
		const categoryName = interaction.options.getString('category');

		// Check if category already exists in database.
		const ranks = await Assignable.find({ category: categoryName });
		if (ranks.length == 0) {
			return await interaction.reply({ content: `Error: ${categoryName} does not exist.`, ephemeral: true });
		}

		let message = `Ranks under ${categoryName}:\n`;
		for (const rank of ranks) {
			message += `\t${rank.rank} ${rank.rp}\n`;
		}

		return await interaction.reply({ content: message, ephemeral: false });
	},
};