import config from '../config.cjs';

const uptime = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "uptime" && cmd !== "runtime") return;

  try {
    // Get total seconds the process has been running
    const totalSeconds = process.uptime();
    
    // Convert seconds into human-readable format
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const runtimeString = `*⏳ Bot Runtime:*\n` +
      `${days > 0 ? `*${days}* Days ` : ""}` +
      `${hours > 0 ? `*${hours}* Hours ` : ""}` +
      `${minutes > 0 ? `*${minutes}* Minutes ` : ""}` +
      `*${seconds}* Seconds`;

    await m.reply(runtimeString);

  } catch (err) {
    console.error("UPTIME CMD ERROR:", err);
    m.reply("❌ Error calculating uptime:\n" + err.message);
  }
};

export default uptime;
