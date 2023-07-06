const { SlashCommandBuilder } = require('discord.js');
const { Assignable } = require('../models/assignable');
const { Player } = require('../models/player');
const { updateLeaderboard } = require('../utilities/scoreboardmanager');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('giverank')
		.setDescription('Assigns a rank to a mentioned player!')
		.addStringOption(option =>
			option.setName('category')
			.setDescription('The name of the category.')
			.setRequired(true))
        .addStringOption(option =>
            option.setName('rank')
			.setDescription('The name of the rank being assigned.')
			.setRequired(true))
        .addUserOption(option =>
            option.setName('player')
            .setDescription('The name of the user.')
            .setRequired(true)),
	async execute(interaction) {
		const categoryName = interaction.options.getString('category');
        const rankName = interaction.options.getString('rank');
        const emoji = '<:PogT:910961173120311296>';

        // id, bot, system, flags, username, discriminator, avatar, ...
        const player = interaction.options.getUser('player');

        // Check if we have this rank.
        const rank = await Assignable.findOne({ category: categoryName, rank: rankName });

        if (!rank) {
            return await interaction.reply({ content: `Error: ${categoryName} ${rankName} does not exist, use /listcategories and /listranks to check available categories and ranks.`, ephemeral: true });
        }

        // Check if we have this player.
        const playerDb = await Player.findOne({ discordID: player.id });

        // If we don't, create a new user.
        if (!playerDb) {
            const newPlayer = new Player({ discordID: player.id, username: player.username, totalRp: rank.rp, ranks: [rank._id] });
            await newPlayer.save();
            try {
                await updateLeaderboard(interaction);
            }
            catch (error) {
                console.log(`Failed to update leaderboard ${error}`);
            }
            return await interaction.reply({ content: `<@${player.id}> reached ${rank.image} ${rank.rank} in ${rank.category}! ${emoji}\nCongratulations on your first rank!`, ephemeral: false });
        }

        // Remove all rank references lost (happens when ranks are removed) .
        await Player.updateOne(
            { _id: player._id },
            { $pull: { ranks: { $nin: await Assignable.distinct('_id') } } },
        );

        // Populate players ranks with assignables.
        const populatedPlayer = await Player.findOne({ discordID: player.id }).populate('ranks');
        const rankIndex = populatedPlayer.ranks.findIndex(playerRank => playerRank.category === categoryName);
        if (rankIndex !== -1) {
            // Rank of same category found, remove it from the unpopulated
            populatedPlayer.ranks[rankIndex] = rank;
        }
        else {
            populatedPlayer.ranks.push(rank);
        }

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
        return await interaction.reply({ content: `<@${player.id}> reached ${rank.image} ${rank.rank} in ${rank.category}! ${emoji}`, ephemeral: false });
	},
};