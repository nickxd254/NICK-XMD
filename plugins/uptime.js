export default async function(Matrix, m, { command, isCmd, from }) {
    if (!isCmd || (command !== 'uptime' && command !== 'runtime')) return;

    const uptime = process.uptime();
    const d = Math.floor(uptime / (3600 * 24));
    const h = Math.floor((uptime % (3600 * 24)) / 3600);
    const m_unit = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const runtimeText = `*NICK-XMD UPTIME* 🕒\n\n` +
        `⏳ *Status:* Online & Stable\n` +
        `🗓️ *Runtime:* ${d}d ${h}h ${m_unit}m ${s}s\n\n` +
        `_The base is holding strong._`;

    await Matrix.sendMessage(from, { 
        text: runtimeText,
        contextInfo: {
            externalAdReply: {
                title: "SYSTEM MONITOR",
                body: "Nick-XMD Core",
                thumbnailUrl: "https://files.catbox.moe/kiy0hl.jpg", // You can change this link
                sourceUrl: "https://github.com/nickxd254/NICK-XMD",
                mediaType: 1
            }
        }
    }, { quoted: m });
}
