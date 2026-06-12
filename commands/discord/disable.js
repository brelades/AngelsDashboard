const state = require("../../state/discordCommandState");
const { MessageFlags } = require("discord.js");

const ALLOWED_ROLES = new Set([
  "1505506104795463762"
]);

const PROTECTED_COMMANDS = new Set([
  "enable",
  "disable",
  "disabled-commands-list"
]);

module.exports = {
  data: {
    name: "disable",
    description: "Disable a command for maintenance",
    options: [
      {
        name: "command",
        description: "Command to disable",
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

      if (PROTECTED_COMMANDS.has(cmd)) {
        return interaction.reply({
          content: "❌ This command cannot be disabled.",
          flags: MessageFlags.Ephemeral
        });
      }

      state.disabledCommands ||= [];

      if (state.disabledCommands.includes(cmd)) {
        return interaction.reply({
          content: `⚠️ \`/${cmd}\` is already disabled.`,
          flags: MessageFlags.Ephemeral
        });
      }

      state.disabledCommands.push(cmd);

      return interaction.reply({
        content: `🚫 \`/${cmd}\` has been disabled for maintenance.`,
        flags: MessageFlags.Ephemeral
      });

    } catch (err) {
      console.log("disable error:", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Something went wrong.",
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};