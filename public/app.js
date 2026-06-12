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

    uptimeSeconds = data.uptime || 0;
    updateUptimeUI();

  } catch {
    document.getElementById("botStatus").textContent = "Offline";
  }
}

// -------------------- FORMAT UPTIME --------------------
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${h}h ${m}m ${s}s`;
}

function updateUptimeUI() {
  const el = document.getElementById("uptime");
  if (el) el.textContent = formatUptime(uptimeSeconds);
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
    (data.twitch || []).forEach(cmd => {
      twitchContainer.innerHTML += `
        <div class="card" onclick="toggleCard(event,this)">
          <div class="card-header">
            <span>${cmd.emoji || "✨"}</span>
            ${cmd.name}
          </div>
          <div class="card-body">
            ${cmd.description || "No description"}
          </div>
        </div>
      `;
    });

    // -------------------- DISCORD --------------------
    (data.discord || []).forEach(cmd => {
      discordContainer.innerHTML += `
        <div class="card" onclick="toggleCard(event,this)">
          <div class="card-header">
            <span>${cmd.emoji || "✨"}</span>
            ${cmd.name}
          </div>
          <div class="card-body">
            ${cmd.description || "No description"}
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

  // live uptime counter
  setInterval(() => {
    uptimeSeconds++;
    updateUptimeUI();
  }, 1000);
});
