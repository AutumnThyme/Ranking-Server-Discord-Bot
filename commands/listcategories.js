const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listcategories')
		.setDescription('Replies with a list of categories you created!'),
	async execute(interaction, db) {
		await interaction.reply('Pong!');
	},
};