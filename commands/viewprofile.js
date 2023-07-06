const { SlashCommandBuilder } = require('discord.js');
const { Assignable } = require('../models/assignable');
const { Player } = require('../models/player');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('viewprofile')
		.setDescription('Sends a message in chat with the users profile.')
        .addUserOption(option =>
            option.setName('player')
            .setDescription('The name of the user.')
            .setRequired(false)),
	async execute(interaction) {
        // id, bot, system, flags, username, discriminator, avatar, ...
        let player = interaction.options.getUser('player');

        if (!player) {
            player = interaction.user;
        }

        // Check if we have this player.
        const playerDb = await Player.findOne({ discordID: player.id });

        // If we don't, no work is needed.
        if (!playerDb) {
            return await interaction.reply({ content: `<@${player.id}> does not have any ranks.`, ephemeral: false });
        }

        // Remove all rank references lost (happens when ranks are removed) .
        await Player.updateOne(
            { _id: player._id },
            { $pull: { ranks: { $nin: await Assignable.distinct('_id') } } },
        );

        // Populate players ranks with assignables.
        const populatedPlayer = await Player.findOne({ discordID: player.id }).populate('ranks');
        let message = `<@${player.id}>'s scoreboard:\n`;
        let totalRp = 0;
        for (const rank of populatedPlayer.ranks) {
            message += `\t\t${rank.category} ${rank.rank} ${rank.rp}\n`;
            totalRp += rank.rp;
        }
        message += `\ttotal rp: ${totalRp}`;

        return await interaction.reply({ content: message, ephemeral: false });
	},
};