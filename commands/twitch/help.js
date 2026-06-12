module.exports = {
  name: "!help",
  description: "Get a link to the bot help page",

  async execute({ client, channel }) {
    const url = "https://brelades.github.io/AngelsAssistant-Commands/";

    client.say(
      channel,
      `📖 Need help? Check here: ${url}`
    );
  }
};