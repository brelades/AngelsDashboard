const botState = require("../../state/botState");

const allowed = [
  "ilovemrtoes"
];

module.exports = {
  name: "!disable",
  description: "Disable a command for maintenance",

  async execute({ client, channel, tags, args }) {
    const user = tags.username.toLowerCase();

    if (!allowed.includes(user)) {
      return client.say(channel, "❌ No permission.");
    }

    const cmd = args[1]?.toLowerCase();

    if (!cmd) {
      return client.say(channel, "Usage: !disable <command>");
    }

    if (botState.disabledCommands.includes(cmd)) {
      return client.say(channel, `⚠️ ${cmd} is already disabled.`);
    }

    botState.disabledCommands.push(cmd);

    client.say(channel, `🚫 Disabled command: ${cmd}`);
  }
};