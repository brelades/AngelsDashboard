module.exports = {
  name: "!status",
  description: "Check if the streamer is live and see current game, title, and viewers",

  async execute({ client, channel, getStreamStatus, process }) {
    const stream = await getStreamStatus(process.env.TWITCH_STREAMER);

    if (!stream) {
      return client.say(
        channel,
        `${process.env.TWITCH_STREAMER} is offline 🔴`
      );
    }

    const game = stream.game_name || "Unknown game";
    const viewers = stream.viewer_count || 0;
    const title = stream.title || "No title";

    client.say(
      channel,
      `🟢 LIVE | ${game} | ${viewers} viewers | ${title}`
    );
  }
};