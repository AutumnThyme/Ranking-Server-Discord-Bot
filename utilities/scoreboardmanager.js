const { Player } = require('../models/player');
const { Scoreboard } = require('../models/scoreboard');

const updateLeaderboard = async (interaction) => {
    // Check if we have a scoreboard object already.
    const scoreboardDB = await Scoreboard.findOne({ name: 'Leaderboard' });

    if (!scoreboardDB) {
        throw new Error('Could not find an existing scoreboard.');
    }

    // Update the scoreboard.
    const channel = interaction.client.channels.cache.get(scoreboardDB.channelID);
    const fetchedMessage = await channel.messages.fetch(scoreboardDB.messageID);
    const top5Emote = '<:Top:342375641846644736>';
    const theLessersEmote = ':small_orange_diamond:';
    let leaderboardMessage = `${top5Emote}---------------- Top 5 ----------------${top5Emote}\n`;

    const players = await Player.find({}).sort({ score: -1 }).limit(100).populate('ranks');

    let i = 1;
    for (const player of players) {
        if (i === 1) {
            leaderboardMessage += `**${i}) ${top5Emote} ${player.totalRp} ${top5Emote} RP - <@${player.discordID}>**\n`;
        }
        else if (i <= 5) {
            leaderboardMessage += `${i}) ${top5Emote} ${player.totalRp} ${top5Emote} RP - <@${player.discordID}>\n`;
        }
        else {
            leaderboardMessage += `${i}) ${theLessersEmote} ${player.totalRp} ${theLessersEmote} RP - <@${player.discordID}>;\n`;
        }

        if (i === 5) {
            leaderboardMessage += `${top5Emote}----------------------------------------${top5Emote}\n`;
        }
        i++;
    }

    // Add this styling if there are less than 5 players to close off the top 5.
    if (i < 5) {
        leaderboardMessage += `${top5Emote}----------------------------------------${top5Emote}\n`;
    }

    fetchedMessage.edit(leaderboardMessage);
};

module.exports = {
    updateLeaderboard,
};