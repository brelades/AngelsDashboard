const User = require("../../models/User");

module.exports = {
  name: "!bal",
  description: "Check your or another user's points balance",

  async execute({ client, channel, tags, args }) {
    const target = (args[1] || tags.username).toLowerCase().trim();

    const user = await User.findOne({ username: target });

    const points = user?.points || 0;

    client.say(channel, `💰 ${target} has ${points} points`);
  }
};