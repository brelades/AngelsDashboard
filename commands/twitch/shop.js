const Shop = require("../../models/Shop");

module.exports = {
  name: "!shop",
  description: "Displays available shop items",

  async execute({ client, channel }) {
    const items = await Shop.find({}).sort({ cost: 1 });

    if (!items.length) {
      return client.say(channel, "❌ Shop is currently empty.");
    }

    const formatted = items.map(item => {
      const stockText = item.stock === 0 ? "∞" : `${item.stock}`;
      return `${item.name || item.item.toUpperCase()} (${item.cost} points | ${stockText})`;
    });

    const message = `🛒 SHOP: ${formatted.join(" | ")} | Use !redeem <item>`;

    client.say(channel, message);
  }
};