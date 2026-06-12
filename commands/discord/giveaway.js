const { EmbedBuilder } = require("discord.js");
const User = require("../../models/User");

const ALLOWED_ROLES = new Set([
  "1503201936055468084",
  "1505506104795463762",
  "1503202295859511430",
  "1503232565337919599"
]);

const EMOJI = "🎉";

/* =========================
   DURATION PARSER
========================= */
function parseDuration(input) {
  const match = input.toString().match(/^(\d+)(s|m|h|d|w)$/i);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}

module.exports = {
  data: {
    name: "giveaway",
    description: "Start a points giveaway"
  },

  async execute(interaction) {
    try {
      const member = interaction.member;

      /* =========================
         ROLE CHECK
      ========================= */
      const hasRole = member.roles.cache.some(r =>
        ALLOWED_ROLES.has(r.id)
      );

      if (!hasRole) {
        return interaction.reply({
          content: "❌ You don't have permission to use this command.",
          ephemeral: true
        });
      }

      const points = interaction.options.getInteger("points");
      const winnersCount = interaction.options.getInteger("winners");
      const timeInput = interaction.options.getString("time");
      const pingRole = interaction.options.getRole("ping"); // NEW

      const durationMs = parseDuration(timeInput);

      if (!durationMs) {
        return interaction.reply({
          content: "❌ Invalid time format (5s, 10m, 1h, 1d, 1w)",
          ephemeral: true
        });
      }

      await interaction.deferReply({ ephemeral: true });

      /* =========================
         CREATE GIVEAWAY EMBED
      ========================= */
      const embed = new EmbedBuilder()
        .setTitle("🎉 POINTS GIVEAWAY 🎉")
        .setDescription(
          `React with 🎉 to enter!\n\n` +
          `💰 **Points per winner:** ${points}\n` +
          `🏆 **Winners:** ${winnersCount}\n` +
          `⏳ **Duration:** ${timeInput}`
        )
        .setColor(0x5865F2)
        .setFooter({ text: "Good luck!" });

      /* =========================
         SEND PUBLIC MESSAGE
      ========================= */
      const content = pingRole ? `${pingRole}` : null;

      const msg = await interaction.channel.send({
        content,
        embeds: [embed]
      });

      await msg.react(EMOJI);

      /* =========================
         EPHEMERAL CONFIRMATION
      ========================= */
      await interaction.editReply({
        content: "✅ Giveaway sent!"
      });

      /* =========================
         END GIVEAWAY
      ========================= */
      setTimeout(async () => {
        try {
          const fetched = await msg.fetch();
          const reaction = fetched.reactions.cache.get(EMOJI);

          if (!reaction) return;

          const users = await reaction.users.fetch();
          const entries = users.filter(u => !u.bot).map(u => u.id);

          if (entries.length === 0) return;

          const shuffled = entries.sort(() => Math.random() - 0.5);
          const winners = shuffled.slice(0, winnersCount);

          let resultText = `🎉 **GIVEAWAY RESULTS** 🎉\n\n`;

          for (const userId of winners) {
            const dbUser = await User.findOne({ discordId: userId });

            if (dbUser) {
              dbUser.points += points;
              await dbUser.save();

              resultText += `🏆 <@${userId}> (+${points} points)\n`;
            } else {
              resultText +=
                `🏆 <@${userId}> (*I tried adding your points, but you haven't linked your account. ` +
              `Read [this message](https://discord.com/channels/1503201400396709928/1513708761037144185/1513725511241699348) ` +
              `then <@1468027747866513479> to manually add them.*)\n`;
            }
          }

          await msg.reply({ content: resultText });

        } catch (err) {
          console.log("Giveaway error:", err);
        }
      }, durationMs);

    } catch (err) {
      console.log("Giveaway crash:", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Giveaway failed.",
          ephemeral: true
        });
      }
    }
  }
};