const { SlashCommandBuilder } = require('discord.js');
const { Assignable } = require('../models/assignable');
const { Player } = require('../models/player');
const { updateLeaderboard } = require('../utilities/scoreboardmanager');
const { default: mongoose } = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('deletes a category!')
		.addStringOption(option =>
			option.setName('category')
			.setDescription('The name of the category you are deleting.')
			.setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.roles.cache.some(role => role.name === 'Admin' || role.name === 'Recruiter')) {
			return await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
		}

		const categoryName = interaction.options.getString('category');

        const lookupStage = {
            $lookup: {
                from: 'assignables',
                localField: 'ranks',
                foreignField: '_id',
                as: 'ranks',
            },
        };

        const matchStage = {
            $match: {
                'ranks.category': categoryName,
            },
        };

        const users = await Player.aggregate([lookupStage, matchStage]);

        const hydratedUsers = await Promise.all(users.map(async user => {
            const hydratedUser = await Player.findById(user._id).populate('ranks');
            return hydratedUser;
        }));

        // Remove the ranks from each user and update the total rp.
        for (const user of hydratedUsers) {
            const index = user.ranks.findIndex(playerRank => playerRank.category === categoryName);
            if (index !== -1) {
                user.ranks.splice(index, 1);
            }

            // Update total rp.
            const totalRp = user.ranks.reduce((acc, v) => acc + v.rp, 0);
            user.totalRp = totalRp;
            await user.save();
        }

        // Delete all ranks under the category.
		await Assignable.deleteMany({ category: categoryName });

        try {
            await updateLeaderboard(interaction);
        }
        catch (error) {
            console.log(`Failed to update leaderboard ${error}`);
        }

        return await interaction.reply({ content: `All ranks under ${categoryName} have been deleted (Removed from ${hydratedUsers.length} users).`, ephemeral: false });
	},
};