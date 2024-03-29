const { SlashCommandBuilder } = require('discord.js');
const { Scoreboard } = require('../models/scoreboard');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deletescoreboard')
		.setDescription('Deletes a scoreboard by name!')
		.addStringOption(option =>
			option.setName('scoreboardname')
			.setDescription('The name of the scoreboard.')
			.setRequired(false)),
	async execute(interaction) {
		let scoreboardName = interaction.options.getString('scoreboardname');
        if (!scoreboardName) {
            scoreboardName = 'Leaderboard';
        }

        // Check if we have a scoreboard object already.
        const scoreboardDB = await Scoreboard.findOne({ name: scoreboardName });
        await Scoreboard.deleteOne({ name: scoreboardName });

        if (scoreboardDB) {
            const channel = interaction.client.channels.cache.get(scoreboardDB.channelID);
            const fetchedMessage = await channel.messages.fetch(scoreboardDB.messageID);
            fetchedMessage.delete();
            return await interaction.reply({ content: `${scoreboardName} deleted.`, ephemeral: true });
        }
        return await interaction.reply({ content: `${scoreboardName} does not exist.`, ephemeral: true });
	},
};