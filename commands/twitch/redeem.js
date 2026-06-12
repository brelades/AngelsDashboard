const User = require("../../models/User");
const Shop = require("../../models/Shop");
const discord = require("../../discordClient");

module.exports = {
  name: "!redeem",
  description: "Redeem shop items using points",

  async execute({ client, channel, tags, args }) {
    const username = tags.username.toLowerCase().trim();
    const itemName = args[1]?.toLowerCase();

    // ---------------- NO INPUT ----------------
    if (!itemName) {
      const items = await Shop.find({}).sort({ cost: 1 });

      const list = items.map(i => {
        const stockText = i.stock === 0 ? "∞" : `${i.stock} left`;
        return `${i.name || i.item.toUpperCase()} (${i.cost} points | ${stockText})`;
      }).join(" | ");

      return client.say(
        channel,
        `🛒 Available: ${list} | Use !redeem <item>`
      );
    }

    // ---------------- USER ----------------
    const user = await User.findOne({ username });

    if (!user) {
      return client.say(channel, "❌ User not found.");
    }

    if (!user.discordId) {
      return client.say(channel, "❌ Link Discord first using !link");
    }

    // ---------------- SHOP ITEM ----------------
    const shop = await Shop.findOne({ item: itemName });

    if (!shop) {
      return client.say(channel, "❌ Item not found.");
    }

    const cost = shop.cost;

    if (!cost) {
      return client.say(channel, "❌ Item cost not configured.");
    }

    // ---------------- ALREADY REDEEMED ----------------
    const alreadyRedeemed =
      user.redeemedItems?.get?.(shop.item) ||
      user.redeemedItems?.[shop.item];

    if (alreadyRedeemed) {
      return client.say(channel, `❌ You already redeemed ${shop.name}.`);
    }

    // ---------------- STOCK ----------------
    if (shop.stock <= 0) {
      return client.say(channel, `❌ ${shop.name} is sold out.`);
    }

    // ---------------- POINTS ----------------
    if (Number(user.points) < cost) {
      return client.say(channel, `❌ Not enough points. You need ${cost}`);
    }

    // ---------------- DEDUCT ----------------
    await User.updateOne(
      { username },
      { $inc: { points: -cost } }
    );

    await Shop.updateOne(
      { item: shop.item, stock: { $gt: 0 } },
      { $inc: { stock: -1 } }
    );

    try {
      const guild = await discord.guilds.fetch(process.env.DISCORD_GUILD_ID);

      const member =
        guild.members.cache.get(user.discordId) ||
        await guild.members.fetch(user.discordId);

      if (!member) throw new Error("Member not found");

      const role =
        guild.roles.cache.get(shop.roleId) ||
        await guild.roles.fetch(shop.roleId);

      if (!role) throw new Error("Role not found");

      await member.roles.add(role);

      // ---------------- MARK REDEEMED ----------------
      await User.updateOne(
        { username },
        {
          $set: {
            [`redeemedItems.${shop.item}`]: true
          }
        }
      );

      // ---------------- CUSTOM ROLE NOTIFY ----------------
      if (shop.item === "custom") {
        const notifyChannel = await discord.channels.fetch("1513736461713801256");

        await notifyChannel.send(
          `<@&1505506104795463762>\n\n<@${user.discordId}> (\`${username}\`) bought a Custom Role.\n\n\n<@${user.discordId}> Please use the </create-role:1513777463690268773> command to create your custom role. After creation, you will be removed from this channel.`
        );
      }

      const updated = await Shop.findOne({ item: shop.item });

      return client.say(
        channel,
        `🎉 @${username} redeemed ${shop.name}! (${updated.stock} left)`
      );

    } catch (err) {
      console.log("REDEEM ERROR FULL:", err);
      return client.say(channel, "⚠️ Failed to assign role.");
    }
  }
};