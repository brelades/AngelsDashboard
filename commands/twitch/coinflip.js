const User = require("../../models/User");

module.exports = {
  name: "!coinflip",
  description: "Bet points on a coin flip (heads or tails)",

  async execute({ client, channel, tags, args }) {
    const username = tags.username.toLowerCase().trim();
    const amount = parseInt(args[1]);
    const choice = args[2]?.toLowerCase();

    if (!amount || amount <= 0) {
      return client.say(channel, "Usage: !coinflip <amount> heads/tails");
    }

    if (!["heads", "tails"].includes(choice)) {
      return client.say(channel, "Pick heads or tails!");
    }

    const user = await User.findOne({ username });

    if (!user || user.points < amount) {
      return client.say(channel, "❌ You don't have enough points.");
    }

    const result = Math.random() < 0.5 ? "heads" : "tails";

    if (result === choice) {
      const winnings = amount;

      await User.updateOne(
        { username },
        { $inc: { points: winnings } }
      );

      return client.say(
        channel,
        `🪙 It landed on ${result}! You won +${winnings} points 🎉`
      );
    } else {
      await User.updateOne(
        { username },
        { $inc: { points: -amount } }
      );

      return client.say(
        channel,
        `💀 It landed on ${result}! You lost ${amount} points.`
      );
    }
  }
};