const { SlashCommandBuilder } = require('discord.js');
const { Assignable } = require('../models/assignable');
const { Player } = require('../models/player');
const { updateLeaderboard } = require('../utilities/scoreboardmanager');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('removerank')
		.setDescription('Removes a rank from a mentioned player!')
		.addStringOption(option =>
			option.setName('category')
			.setDescription('The name of the category.')
			.setRequired(true))
        .addStringOption(option =>
            option.setName('rank')
			.setDescription('The name of the rank being removed.')
			.setRequired(true))
        .addUserOption(option =>
            option.setName('player')
            .setDescription('The name of the user.')
            .setRequired(true)),
	async execute(interaction) {
		const categoryName = interaction.options.getString('category');
        const rankName = interaction.options.getString('rank');

        // id, bot, system, flags, username, discriminator, avatar, ...
        const player = interaction.options.getUser('player');

        // Check if we have this player.
        const playerDb = await Player.findOne({ discordID: player.id });

        // If we don't, no work is needed.
        if (!playerDb) {
            return await interaction.reply({ content: `<@${player.id}> does not have any ranks.`, ephemeral: true });
        }

        // Remove all rank references lost (happens when ranks are removed) .
        await Player.updateOne(
            { _id: player._id },
            { $pull: { ranks: { $nin: await Assignable.distinct('_id') } } },
        );

        // Populate players ranks with assignables.
        const populatedPlayer = await Player.findOne({ discordID: player.id }).populate('ranks');
        const rankIndex = populatedPlayer.ranks.findIndex(playerRank => playerRank.category === categoryName && playerRank.rank === rankName);
        if (rankIndex !== -1) {
            // Rank found, remove it from the array.
            populatedPlayer.ranks.splice(rankIndex, 1);
            // Update total rp.
            const totalRp = populatedPlayer.ranks.reduce((acc, v) => acc + v.rp, 0);
            populatedPlayer.totalRp = totalRp;
            await populatedPlayer.save();
            try {
                await updateLeaderboard(interaction);
            }
            catch (error) {
                console.log(`Failed to update leaderboard ${error}`);
            }
            return await interaction.reply({ content: `Removed ${categoryName} ${rankName} from ${player.username}`, ephemeral: true });
        }
        else {
            return await interaction.reply({ content: `Error: ${player.username} does not have rank ${categoryName} ${rankName}.`, ephemeral: true });
        }
	},
};