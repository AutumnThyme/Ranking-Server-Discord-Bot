const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listranks')
		.setDescription('Replies with a list of ranks and their associated rank points for the given category!'),
	async execute(interaction, db) {
		await interaction.reply('Pong!');
	},
};