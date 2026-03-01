import config from '../config.cjs';

const uptime = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  // Command triggers
  if (cmd !== "uptime" && cmd !== "runtime") return;

  try {
    const seconds = process.uptime();
    
    // Formatting logic
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m_units = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const uptimeString = `*Runtime:* ${d}d ${h}h ${m_units}m ${s}s`;

    await gss.sendMessage(m.from, {
      text: `*🤖 Bot Status*\n\n${uptimeString}\n*Status:* Active 🚀`,
    }, { quoted: m });

  } catch (err) {
    console.error("UPTIME CMD ERROR:", err);
    m.reply("❌ Error fetching uptime.");
  }
};

export default uptime;
