const User = require("../../models/User");

const allowed = [
  "y0urangel_",
  "angelsassistant",
  "ilovemrtoes",
  "itzzz_r4ven",
  "skullie_boo"
];

module.exports = {
  name: "!addpoints",
  description: "Add points to a linked user",

  async execute({ client, channel, tags, args }) {
    if (!allowed.includes(tags.username.toLowerCase())) {
      return client.say(channel, "❌ No permission.");
    }

    const target = args[1]?.toLowerCase();
    const amount = parseInt(args[2]);

    if (!target || isNaN(amount)) {
      return client.say(channel, "Usage: !addpoints user amount");
    }

    await User.findOneAndUpdate(
      { username: target },
      { $inc: { points: amount } },
      { upsert: true }
    );

    client.say(channel, `✅ Added ${amount} points to ${target}`);
  }
};