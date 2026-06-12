const state = require("../../state/discordCommandState");
const { MessageFlags } = require("discord.js");

const ALLOWED_ROLES = new Set([
  "1505506104795463762"
]);

module.exports = {
  data: {
    name: "enable",
    description: "Enable a command",
    options: [
      {
        name: "command",
        description: "Command to enable",
        type: 3,
        required: true
      }
    ]
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

      const cmd = interaction.options
        .getString("command")
        ?.toLowerCase()
        ?.trim();

      if (!cmd) {
        return interaction.reply({
          content: "❌ You must provide a command.",
          flags: MessageFlags.Ephemeral
        });
      }

      state.disabledCommands ||= [];

      if (!state.disabledCommands.includes(cmd)) {
        return interaction.reply({
          content: `⚠️ \`/${cmd}\` is not disabled.`,
          flags: MessageFlags.Ephemeral
        });
      }

      state.disabledCommands = state.disabledCommands.filter(c => c !== cmd);

      return interaction.reply({
        content: `✅ \`/${cmd}\` has been enabled.`,
        flags: MessageFlags.Ephemeral
      });

    } catch (err) {
      console.log("enable error:", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Something went wrong.",
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};