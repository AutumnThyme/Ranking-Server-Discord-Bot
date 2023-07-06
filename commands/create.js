const { SlashCommandBuilder } = require('discord.js');
const { Assignable } = require('../models/assignable');
const { DefaultRanks } = require('../models/defaults');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('creates a category!')
		.addStringOption(option =>
			option.setName('category')
			.setDescription('The name of the category you are creating.')
			.setRequired(true))
		.addBooleanOption(option =>
			option.setName('use_default_ranks')
			.setDescription('Initialize the category from the predefined ranks')
			.setRequired(true))
		.addStringOption(option =>
			option.setName('ranks')
			.setDescription('Populates the ranks from json (ignored if default ranks is set to True)')
			.setRequired(false)),
	async execute(interaction) {
		if (!interaction.member.roles.cache.some(role => role.name === 'Admin' || role.name === 'Recruiter')) {
			return await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
		}

		const categoryName = interaction.options.getString('category');
		const usingDefaults = interaction.options.getBoolean('use_default_ranks');
		const ranks = interaction.options.getString('ranks');

		// Check if category already exists in database.
		const existingCategory = await Assignable.findOne({ category_name: categoryName });
		if (existingCategory) {
			return await interaction.reply({ content: `Error: ${categoryName} already exists.`, ephemeral: true });
		}

		// Add empty category if usingDefaults is false.
		let categoryRanks = [];

		// Otherwise, populate with default ranks.
		if (usingDefaults) {
			categoryRanks = [...DefaultRanks];
		}
		else {
			// Format: { ranks: [] }
			try {
				categoryRanks = JSON.parse(ranks).ranks;
			}
			catch (error) {
				return await interaction.reply({ content: `unable to parse custom ranks\nError: ${error.message}`, ephemeral: true });
			}
		}

		try {
			// name, rp, rank_image + category
			let responseLog = '';
			for (const assignableRank of categoryRanks) {
				const previousAssignable = await Assignable.findOne({ category: categoryName, rank: assignableRank.name });
				if (previousAssignable) {
					// Duplicate rank detected (ignoring)
					responseLog += `ignored ${categoryName}, ${assignableRank.name} as it already exists\n`;
				}
				await Assignable.create({
					category: categoryName,
					rank: assignableRank.name,
					rp: assignableRank.rp,
					image: assignableRank.image,
				});
			}
			responseLog += `successfully added ${categoryName}`;
			return await interaction.reply({ content: responseLog, ephemeral: true });
		}
		catch (error) {
			return await interaction.reply({ content: `failed to add ${categoryName}\nError: ${error.message}`, ephemeral: true });
		}
	},
};