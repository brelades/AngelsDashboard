const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

// -------------------- STATUS --------------------
app.get("/api/status", (req, res) => {
  res.json({
    bot: "Online",
    uptime: Math.floor(process.uptime())
  });
});

// -------------------- COMMANDS API (FROM JSON FILE) --------------------
app.get("/api/commands", (req, res) => {
  try {
    const filePath = path.join(__dirname, "commands.json");

    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    res.json({
      twitch: data.twitch || [],
      discord: data.discord || []
    });

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
