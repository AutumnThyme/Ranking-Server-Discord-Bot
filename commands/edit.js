const { SlashCommandBuilder } = require('discord.js');
const { Assignable } = require('../models/assignable');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit')
		.setDescription('edits a category!')
		.addStringOption(option =>
			option.setName('category')
			.setDescription('The name of the category you are editing.')
			.setRequired(true))
		.addStringOption(option =>
			option.setName('rank_edit_json')
			.setDescription('Edits the categories data based on a json object')
			.setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.roles.cache.some(role => role.name === 'Admin' || role.name === 'Recruiter')) {
			return await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
		}

		const categoryName = interaction.options.getString('category');
		const edit_json = interaction.options.getString('rank_edit_json');

		// Check if category already exists in database.
		const existingCategory = await Assignable.findOne({ category: categoryName });
		if (!existingCategory) {
			return await interaction.reply({ content: `Error: ${categoryName} does not exist.`, ephemeral: true });
		}

        /**
         * Format:
         * {
         *    changeCategoryName: bool
         *    newCategoryName: string
         *    rankEdits: [
         *      { oldRankName: string, newRankName: string, editRankRp: bool, newRankRp: number },
         *      { deleteRank: string }
         *    ]
         * }
         */
        let updatedRanks = 0;
        let deletedRanks = 0;
        try {
            const edits = JSON.parse(edit_json);
            if (edits.changeCategoryName && edits.rankEdits.length == 0) {
                Assignable.updateMany({ category: categoryName }, { $set: { category: edits.newCategoryName } });
            }
            else {
                // Get all documents under category name.
                let newCategoryName = categoryName;
                if (edits.changeCategoryName) {
                    newCategoryName = edits.newCategoryName;
                }
                for (const edit of edits.rankEdits) {
                    if (Object.prototype.hasOwnProperty.call(edit, 'deleteRank')) {
                        await Assignable.deleteOne({ category: categoryName, rank: edit.deleteRank });
                        deletedRanks++;
                    }
                    else {
                        const body = { $set: { category: newCategoryName, rank: edit.newRankName } };
                        if (edit.editRankRp) {
                            body.$set.rp = edit.newRankRp;
                        }
                        await Assignable.updateOne({ category: categoryName, rank: edit.oldRankName }, body);
                        updatedRanks++;
                    }
                }
            }
        }
        catch (error) {
            return await interaction.reply({ content: `unable to parse edit_json\nError: ${error.message}`, ephemeral: true });
        }
        return await interaction.reply({ content: `successfully updated ${updatedRanks} ranks and deleted ${deletedRanks} ranks.`, ephemeral: false });
	},
};