const User = require("../../models/User");

module.exports = {
  data: {
    name: "check-points",
    description: "Check your or another user's points balance"
  },

  async execute(interaction) {
    try {
      const targetUser =
        interaction.options.getUser("user") || interaction.user;

      const user = await User.findOne({
        discordId: targetUser.id
      });

      if (!user) {
        if (targetUser.id === interaction.user.id) {
          return interaction.reply({
            content:
              "❌ Your Discord account isn't linked to a Twitch account yet.\n\nUse </link:1513711158237069352> first.",
            ephemeral: true
          });
        }

        return interaction.reply({
          content: `❌ ${targetUser.username} hasn't linked their Twitch account.`,
          ephemeral: true
        });
      }

      if (targetUser.id === interaction.user.id) {
        return interaction.reply({
          content: `💰 You currently have **${user.points.toLocaleString()}** points.`,
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `💰 **${targetUser.username}** currently has **${user.points.toLocaleString()}** points.`,
        ephemeral: true
      });

    } catch (err) {
      console.log("Points command error:", err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Failed to retrieve points.",
          ephemeral: true
        });
      }
    }
  }
};