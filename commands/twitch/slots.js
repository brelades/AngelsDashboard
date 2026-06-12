const User = require("../../models/User");

const EMOJIS = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣"];

const PAYOUTS = {
  "🍒🍒🍒": 3,
  "🍋🍋🍋": 4,
  "🍊🍊🍊": 5,
  "🍇🍇🍇": 7,
  "💎💎💎": 10,
  "7️⃣7️⃣7️⃣": 20
};

const cooldowns = new Map();

function spin() {
  return [
    EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  ];
}

module.exports = {
  name: "!slots",
  description: "Try your luck on the slot machine",

  async execute({ client, channel, tags, args }) {
    const username = tags.username.toLowerCase().trim();

    // cooldown
    if (cooldowns.has(username)) {
      return client.say(channel, "⏳ Slow down! Wait before spinning again.");
    }

    cooldowns.set(username, true);
    setTimeout(() => cooldowns.delete(username), 5000);

    const bet = Number(args[1]);

    if (!bet || bet <= 0) {
      return client.say(channel, "Usage: !slots <bet>");
    }

    if (bet > 2500) {
      return client.say(channel, "❌ Max bet is 2500 points.");
    }

    const user = await User.findOne({ username });

    if (!user || user.points < bet) {
      return client.say(channel, `❌ Not enough points to bet ${bet}.`);
    }

    // 🎰 spin result
    const result = spin();
    const key = result.join("");

    let multiplier = PAYOUTS[key] || 0;

    // house edge (only applies on wins)
    if (multiplier > 0) {
      multiplier *= 0.9;
    }

    const winnings = Math.floor(bet * multiplier);
    const net = winnings - bet;

    // 🔥 ALWAYS APPLY UPDATE (no early returns before this)
    await User.updateOne(
      { username },
      { $inc: { points: net } }
    );

    // output logic only (NO DB logic here)
    if (multiplier === 0) {
      return client.say(
        channel,
        `🎰 ${result.join(" | ")} → You lost ${bet} points 💀`
      );
    }

    if (net > 0) {
      return client.say(
        channel,
        `🎰 ${result.join(" | ")} → You won ${winnings} (+${net}) 🟢`
      );
    }

    return client.say(
      channel,
      `🎰 ${result.join(" | ")} → Break even`
    );
  }
};