import config from '../config.cjs';

const ping = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  // Support both 'ping' and 'p' as shorthand
  if (cmd !== "ping" && cmd !== "p") return;

  try {
    const start = Date.now();
    
    // Initial reaction or message to show it's processing
    const { key } = await m.reply("*⚡ Checking speed...*");
    
    const end = Date.now();
    const responseTime = end - start;

    // Final message with latency
    await gss.sendMessage(m.from, {
      text: `*🏓 Pong!* \n\n*Latency:* ${responseTime}ms\n*Status:* Online ✅`,
      edit: key // Edits the previous message if the library supports it
    });

  } catch (err) {
    console.error("PING CMD ERROR:", err);
    m.reply("❌ Error executing ping:\n" + err.message);
  }
};

export default ping;
