const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

// -------------------- EXCLUDED COMMANDS --------------------
const EXCLUDED = new Set([
  "!addpoints",
  "!removepoints",
  "!restock",
  "giveaway",
  "points-add",
  "points-remove",
  "!disable",
  "!enable",
  "disable",
  "enable",
  "disabled-commands-list"
]);

// -------------------- EMOJIS --------------------
const COMMAND_EMOJIS = {
  bal: "💰",
  botuptime: "⏱️",
  coinflip: "🪙",
  help: "📖",
  linkdiscord: "🤝",
  redeem: "🎟️",
  shop: "🛒",
  slots: "🎰",
  socials: "🐦",
  status: "📡",
  vipdaily: "💎",

  "check-points": "❓",
  "create-role": "🎨",
  leaderboard: "🏆",
  link: "🔗"
};

// -------------------- PLATFORM ICONS --------------------
const PLATFORM_ICONS = {
  twitch:
    "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitch.svg",
  discord:
    "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg"
};

// -------------------- STATUS --------------------
app.get("/api/status", (req, res) => {
  res.json({
    bot: "Online",
    uptime: Math.floor(process.uptime())
  });
});

// -------------------- COMMAND NORMALIZER --------------------
function normalizeCommand(cmd, file, platform) {
  const name =
    cmd.name ||
    cmd.data?.name ||
    file.replace(".js", "");

  const cleanName = name.replace(/^!/, "");

  return {
    name,
    description:
      cmd.description ||
      cmd.data?.description ||
      "No description available",

    emoji:
      cmd.emoji ||
      COMMAND_EMOJIS[cleanName] ||
      "✨",

    platform,
    platformIcon: PLATFORM_ICONS[platform]
  };
}

// -------------------- SAFE FILE LOADER --------------------
function loadCommands(folder, platform) {
  const results = [];

  if (!fs.existsSync(folder)) return results;

  const files = fs.readdirSync(folder);

  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    const fullPath = path.join(folder, file);

    try {
      delete require.cache[require.resolve(fullPath)];
      const cmd = require(fullPath);

      const normalized = normalizeCommand(cmd, file, platform);

      const rawName = normalized.name;
      const cleanName = rawName.replace(/^!/, "");

      if (EXCLUDED.has(rawName) || EXCLUDED.has(cleanName)) continue;

      results.push(normalized);

    } catch (err) {
      console.log(`[${platform.toUpperCase()} ERROR]`, file, err.message);
    }
  }

  return results;
}

// -------------------- COMMANDS API --------------------
app.get("/api/commands", (req, res) => {
  try {
    const basePath = path.join(__dirname, "..", "commands");

    const twitchPath = path.join(basePath, "twitch");
    const discordPath = path.join(basePath, "discord");

    const twitch = loadCommands(twitchPath, "twitch");
    const discord = loadCommands(discordPath, "discord");

    res.json({ twitch, discord });

  } catch (err) {
    console.error("COMMANDS API ERROR:", err);

    res.json({
      twitch: [],
      discord: []
    });
  }
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Dashboard running on port ${PORT}`);
});