const { MessageFlags } = require("discord.js");
const state = require("../../state/discordCommandState");

const ALLOWED_ROLES = new Set([
  "1503201936055468084",
  "1505506104795463762",
  "1503202295859511430",
  "1503232565337919599"
]);

module.exports = {
  data: {
    name: "disabled-commands-list",
    description: "Show currently disabled commands"
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

      const disabled = state.disabledCommands;

      if (!disabled || disabled.length === 0) {
        return interaction.reply({
          content: "✅ No commands are currently disabled.",
          flags: MessageFlags.Ephemeral
        });
      }

      const lines = disabled
        .map(cmd => `${cmd}`)
        .join("\n");

      return interaction.reply({
        content: `# Disabled Commands:\n\n\`${lines}\``,
        flags: MessageFlags.Ephemeral
      });

    } catch (err) {
      console.log("disabled command error:", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Failed to fetch disabled commands.",
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};