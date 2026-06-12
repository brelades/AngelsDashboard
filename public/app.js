function toggleCategory(el) {
  el.classList.toggle("active");
}

function toggleCard(e, el) {
  e.stopPropagation();
  el.classList.toggle("active");
}

// -------------------- UPTIME STATE --------------------
let uptimeSeconds = 0;

// -------------------- STATUS --------------------
async function loadStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();

    document.getElementById("botStatus").textContent = data.bot;

    // only set once from server
    uptimeSeconds = data.uptime;

    updateUptimeUI();

  } catch {
    document.getElementById("botStatus").textContent = "offline";
  }
}

// format uptime nicely
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${h}h ${m}m ${s}s`;
}

// update UI without fetching server
function updateUptimeUI() {
  document.getElementById("uptime").textContent =
    formatUptime(uptimeSeconds);
}

// -------------------- COMMANDS --------------------
async function loadCommands() {
  try {
    const res = await fetch("/api/commands");
    const data = await res.json();

    const twitchContainer = document.getElementById("twitchCommands");
    const discordContainer = document.getElementById("discordCommands");

    twitchContainer.innerHTML = "";
    discordContainer.innerHTML = "";

    // -------------------- TWITCH --------------------
    data.twitch.forEach(cmd => {
      twitchContainer.innerHTML += `
        <div class="card" onclick="toggleCard(event,this)">
          <div class="card-header">
            <span>${cmd.emoji}</span>
            ${cmd.name.replace(/^!/, "")}
          </div>
          <div class="card-body">
            ${cmd.description}
          </div>
        </div>
      `;
    });

    // -------------------- DISCORD --------------------
    data.discord.forEach(cmd => {
      discordContainer.innerHTML += `
        <div class="card" onclick="toggleCard(event,this)">
          <div class="card-header">
            <span>${cmd.emoji}</span>
            ${cmd.name}
          </div>
          <div class="card-body">
            ${cmd.description}
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error("Failed to load commands:", err);
  }
}

// -------------------- INIT --------------------
document.addEventListener("DOMContentLoaded", () => {
  const stars = document.getElementById("stars");

  for (let i = 0; i < 70; i++) {
    const star = document.createElement("div");

    star.className = "star";
    star.style.left = Math.random() * 100 + "vw";
    star.style.animationDuration = 3 + Math.random() * 5 + "s";

    stars.appendChild(star);
  }

  loadStatus();
  loadCommands();

  // 🔥 live uptime counter (no refresh needed)
  setInterval(() => {
    uptimeSeconds++;
    updateUptimeUI();
  }, 1000);
});