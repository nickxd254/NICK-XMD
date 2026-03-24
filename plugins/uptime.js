const { cmd } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "runtime",
    desc: "Check bot uptime.",
    category: "main",
    react: "⏳",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    const msg = await reply("*Calculating uptime...*");

    const text = `⏳ *Bot Uptime:* ${runtime(process.uptime())}`;

    await conn.sendMessage(from, { text }, { edit: msg.key });
});
