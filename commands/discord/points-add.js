const { MessageFlags } = require("discord.js");
const User = require("../../models/User");

const ALLOWED_ROLES = new Set([
  "1503201936055468084",
  "1505506104795463762",
  "1503202295859511430",
  "1503232565337919599"
]);

module.exports = {
  data: {
    name: "points-add",
    description: "Add points to a linked user"
  },

  async execute(interaction) {
    try {
      const hasRole = interaction.member.roles.cache.some(role =>
        ALLOWED_ROLES.has(role.id)
      );

      if (!hasRole) {
        return interaction.reply({
          content: "❌ You don't have permission to use this command.",
          flags: MessageFlags.Ephemeral
        });
      }

      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      if (amount <= 0) {
        return interaction.reply({
          content: "❌ Amount must be greater than 0.",
          flags: MessageFlags.Ephemeral
        });
      }

      const dbUser = await User.findOne({
        discordId: user.id
      });

      if (!dbUser) {
        return interaction.reply({
          content: "❌ That user hasn't linked their Twitch account.",
          flags: MessageFlags.Ephemeral
        });
      }

      dbUser.points += amount;
      await dbUser.save();

      return interaction.reply({
        content:
          `✅ Added **${amount.toLocaleString()}** points to <@${user.id}>.\n` +
          `💰 New Balance: **${dbUser.points.toLocaleString()}**`,
        flags: MessageFlags.Ephemeral
      });

    } catch (err) {
      console.log("points-add error:", err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Failed to add points.",
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};