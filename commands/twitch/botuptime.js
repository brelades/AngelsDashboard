function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  let result = [];
  if (days) result.push(`${days}d`);
  if (hours) result.push(`${hours}h`);
  if (minutes) result.push(`${minutes}m`);
  if (seconds && days === 0) result.push(`${seconds}s`);

  return result.join(" ");
}

module.exports = {
  name: "!botuptime",
  description: "Shows how long AngelsAssistant has been running",

  async execute({ client, channel, startTime }) {
    const uptime = formatUptime(Date.now() - startTime);

    client.say(
      channel,
      `🤖 AngelsAssistant has been running for ${uptime}!`
    );
  }
};