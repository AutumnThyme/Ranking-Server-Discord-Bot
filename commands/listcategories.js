const { SlashCommandBuilder } = require('discord.js');
const { Assignable } = require('../models/assignable');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('listcategories')
		.setDescription('Replies with a list of categories you created!'),
	async execute(interaction) {
		const ranks = await Assignable.find({});
		if (ranks.length == 0) {
			return await interaction.reply({ content: 'Unable to find any categories.', ephemeral: true });
		}

		let categories = new Set();
		for (const rank of ranks) {
			categories.add(rank.category);
		}

		categories = [...categories];
		categories.sort();
		let message = 'Categories:\n';
		for (const category of categories) {
			message += '\t' + category + '\n';
		}
		return await interaction.reply({ content: message, ephemeral: false });
	},
};