const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-role")
    .setDescription("Create your custom role")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("Name of your custom role")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("colour")
        .setDescription("Hex colour (e.g. #ff0000)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const customRoleId = process.env.DISCORD_CUSTOM_ROLE_ID;

    const member = interaction.member;
    const guild = interaction.guild;

    const name = interaction.options.getString("name");
    const colour = interaction.options.getString("colour");

    // ---------------- CHECK PERMISSION ROLE ----------------
    if (!member.roles.cache.has(customRoleId)) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command.",
        ephemeral: true
      });
    }

    // ---------------- VALIDATE HEX ----------------
    const hexRegex = /^#?[0-9A-Fa-f]{6}$/;

    if (!hexRegex.test(colour)) {
      return interaction.reply({
        content: "❌ Invalid colour. Use hex format like #ff0000.",
        ephemeral: true
      });
    }

    const finalColor = colour.startsWith("#") ? colour : `#${colour}`;

    try {
      // ---------------- CREATE ROLE ----------------
      const role = await guild.roles.create({
        name: name,
        color: finalColor,
        reason: `Custom role created by ${interaction.user.tag}`
      });

      // ---------------- ADD ROLE TO USER ----------------
      await member.roles.add(role);

      // ---------------- REMOVE CUSTOM ACCESS ROLE AFTER 10s ----------------
      setTimeout(async () => {
        try {
          if (member.roles.cache.has(customRoleId)) {
            await member.roles.remove(customRoleId);
          }
        } catch (err) {
          console.log("Failed to remove custom role access:", err.message);
        }
      }, 10_000);

      // ---------------- RESPONSE ----------------
      return interaction.reply({
        content: `🎉 Your role <@&${role.id}> has been created and added.`,
        ephemeral: true
      });

    } catch (err) {
      console.log("CREATE ROLE ERROR:", err);

      return interaction.reply({
        content: "⚠️ Failed to create role.",
        ephemeral: true
      });
    }
  }
};