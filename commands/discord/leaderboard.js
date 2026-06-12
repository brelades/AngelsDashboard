const { EmbedBuilder } = require("discord.js");
const User = require("../../models/User");

module.exports = {
  data: {
    name: "leaderboard",
    description: "View the points leaderboard"
  },

  async execute(interaction) {
    try {
      const topUsers = await User.find({
  points: { $gt: 0 }
})
  .sort({ points: -1 })
  .limit(10);

      if (!topUsers.length) {
        return interaction.reply({
          content: "Leaderboard is currently empty. Start chatting when [Angel](<https://www.twitch.tv/y0urangel_>) is live to gain points!",
          ephemeral: true
        });
      }

      let description = "";

      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];

        const displayName = user.discordId
          ? `<@${user.discordId}>`
          : user.username || "Unknown User";

        const medal =
          i === 0 ? "🥇" :
          i === 1 ? "🥈" :
          i === 2 ? "🥉" :
          `**${i + 1}.**`;

        description +=
          `${medal} ${displayName} — **${user.points.toLocaleString()}** points\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle("🏆 Points Leaderboard")
        .setDescription(description)
        .setColor(0xF1C40F)
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });

    } catch (err) {
      console.log("Leaderboard error:", err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Failed to load leaderboard.",
          ephemeral: true
        });
      }
    }
  }
};