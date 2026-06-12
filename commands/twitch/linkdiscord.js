const User = require("../../models/User");

module.exports = {
  name: "!linkdiscord",
  description: "Link your Twitch account to Discord",

  async execute({ client, channel, tags }) {
    const username = tags.username.toLowerCase();

    const user = await User.findOne({ username });

    // 1. Already linked check
    if (user?.discordId) {
      return client.say(
        channel,
        `@${username} your Twitch account is already linked to Discord.`
      );
    }

    // 2. Optional: active code check (prevents spam regenerating codes)
    if (
      user?.linkCode &&
      user?.linkCodeExpires &&
      user.linkCodeExpires > Date.now()
    ) {
      return client.say(
        channel,
        `@${username} you already have an active link code: ${user.linkCode}`
      );
    }

    // 3. Generate new code
    const code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const expires = Date.now() + 10 * 60 * 1000;

    // 4. Save/update
    await User.findOneAndUpdate(
      { username },
      {
        username,
        linkCode: code,
        linkCodeExpires: expires
      },
      { upsert: true }
    );

    client.say(
      channel,
      `@${username} Your Discord link code is: ${code} (expires in 10 minutes). Run /link in the Discord server.`
    );
  }
};