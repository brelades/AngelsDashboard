const Shop = require("../../models/Shop");

const ADMIN_USERS = [
  "ilovemrtoes"
];

module.exports = {
  name: "!restock",
  description: "Restock the shop",

  async execute({ client, channel, tags, args }) {
    const username = tags.username.toLowerCase().trim();

    // 🔒 permission check
    if (!ADMIN_USERS.includes(username)) {
      return client.say(channel, "❌ You are not allowed to use this command.");
    }

    const item = args[1]?.toLowerCase();
    const amount = Number(args[2]);

    if (!item || !amount || isNaN(amount)) {
      return client.say(channel, "Usage: !restock vip 15");
    }

    const shop = await Shop.findOne({ item });

    if (!shop) {
      return client.say(channel, `❌ Item '${item}' does not exist.`);
    }

    await Shop.updateOne(
      { item },
      { $set: { stock: amount } }
    );

    client.say(
      channel,
      `📦 Restocked ${item} to ${amount} units.`
    );

    console.log(`ADMIN ${username} restocked ${item} → ${amount}`);
  }
};