const { SlashCommandBuilder } = require('discord.js');
const { Assignable } = require('../models/assignable');
const { Player } = require('../models/player');
const { updateLeaderboard } = require('../utilities/scoreboardmanager');

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

		// Delete all ranks under the category.
		await Assignable.deleteMany({ category: categoryName });

        // Get all users with the rank category.
        const users = await Player.aggregate([
            {
                $lookup: {
                    from: 'assignable',
                    localField: 'ranks',
                    foreignField: '_id',
                    as: 'ranks',
                },
            },
            {
                $match: {
                    'ranks.category': categoryName,
                },
            },
        ]);

        // Remove the ranks from each user and update the total rp.
        for (const user of users) {
            const index = user.ranks.findIndex(playerRank => playerRank.category === categoryName);
            if (index !== -1) {
                users.ranks.splice(index, 1);
            }

            // Update total rp.
            const totalRp = user.ranks.reduce((acc, v) => acc + v.rp, 0);
            user.totalRp = totalRp;
        }

        try {
            await updateLeaderboard(interaction);
        }
        catch (error) {
            console.log(`Failed to update leaderboard ${error}`);
        }

        return await interaction.reply({ content: `All ranks under ${categoryName} have been deleted (Removed from ${users.length} users).`, ephemeral: false });
	},
};