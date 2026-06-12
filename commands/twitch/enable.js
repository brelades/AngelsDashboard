const botState = require("../../state/botState");

const allowed = [
  "ilovemrtoes"
];

module.exports = {
  name: "!enable",
  description: "Enable a command",

  async execute({ client, channel, tags, args }) {
    const user = tags.username.toLowerCase();

    if (!allowed.includes(user)) {
      return client.say(channel, "❌ No permission.");
    }

    const cmd = args[1]?.toLowerCase();

    if (!cmd) {
      return client.say(channel, "Usage: !enable <command>");
    }

    if (!botState.disabledCommands.includes(cmd)) {
      return client.say(channel, `⚠️ ${cmd} is not disabled.`);
    }

    botState.disabledCommands = botState.disabledCommands.filter(
      c => c !== cmd
    );

    client.say(channel, `✅ Enabled command: ${cmd}`);
  }
};