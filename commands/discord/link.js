const { SlashCommandBuilder } = require("discord.js");
const User = require("../../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your Twitch account to Discord")
    .addStringOption(option =>
      option
        .setName("code")
        .setDescription("Code from !linkdiscord on Twitch")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const code = interaction.options
        .getString("code")
        .toUpperCase()
        .trim();

      const discordId = interaction.user.id;

      await interaction.deferReply({
        ephemeral: true
      });

      const existingDiscord = await User.findOne({
        discordId
      });

      if (existingDiscord) {
        return interaction.editReply(
          `❌ Your Discord account is already linked.`
        );
      }

      const user = await User.findOne({
        linkCode: code
      });

      if (!user) {
        return interaction.editReply(
          `❌ You have supplied an invalid code.`
        );
      }

      if (
        !user.linkCodeExpires ||
        user.linkCodeExpires < Date.now()
      ) {
        return interaction.editReply(
          `❌ That code has expired. Generate a new one with \`!linkdiscord\` on twitch.`
        );
      }

      user.discordId = discordId;
      user.linkCode = null;
      user.linkCodeExpires = null;

      await user.save();

      return interaction.editReply(
        `🔗 Linked your Discord to \`${user.username}\` successfully!`
      );
    } catch (err) {
      console.error("LINK COMMAND ERROR:", err);

      if (interaction.deferred || interaction.replied) {
        return interaction.editReply(
          "⚠️ Something went wrong."
        );
      }

      return interaction.reply({
        content: "⚠️ Something went wrong.",
        ephemeral: true
      });
    }
  }
};