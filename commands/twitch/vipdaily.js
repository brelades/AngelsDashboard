const User = require("../../models/User");
const discord = require("../../discordClient");

module.exports = {
  name: "!vipdaily",
  description: "Claim your VIP daily reward (Restricted to those who purchased VIP)",

  async execute({ client, channel, tags }) {
    const username = tags.username.toLowerCase().trim();

    const user = await User.findOne({ username });

    if (!user) {
      return client.say(channel, "❌ User not found.");
    }

    if (!user.discordId) {
      return client.say(channel, "❌ Link Discord first using !link");
    }

    try {
      const guild = await discord.guilds.fetch(process.env.DISCORD_GUILD_ID);

      const member =
        guild.members.cache.get(user.discordId) ||
        await guild.members.fetch(user.discordId);

      if (!member) {
        return client.say(channel, "❌ Discord member not found.");
      }

      const vipRole = process.env.DISCORD_VIP_ROLE_ID;

      if (!member.roles.cache.has(vipRole)) {
        return client.say(channel, "❌ VIP only command.");
      }

      // ---------------- COOLDOWN (24h) ----------------
      const now = Date.now();
      const cooldown = 24 * 60 * 60 * 1000;

      if (user.lastVipDaily && now - user.lastVipDaily < cooldown) {
        const remaining = cooldown - (now - user.lastVipDaily);
        const hours = Math.floor(remaining / (1000 * 60 * 60));

        return client.say(
          channel,
          `⏳ You already claimed your VIP daily. Try again in ${hours}h.`
        );
      }

      // ---------------- REWARD ----------------
      const reward = 10000;

      await User.updateOne(
        { username },
        {
          $inc: { points: reward },
          $set: { lastVipDaily: now }
        }
      );

      return client.say(
        channel,
        `💎 @${username} claimed VIP Daily (+${reward} points)`
      );

    } catch (err) {
      console.log("VIPDAILY ERROR:", err);
      return client.say(channel, "⚠️ Failed to process VIP daily.");
    }
  }
};