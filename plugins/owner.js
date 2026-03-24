const { cmd } = require('../command');

cmd({
    pattern: "owner",
    desc: "Show bot owner.",
    category: "main",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    const msg = await reply("*Fetching owner info...*");

    const text = `
👑 *BOT OWNER*
━━━━━━━━━━━━━━━
Name: NICKSON
Bot: NICK-XMD
Status: Active
━━━━━━━━━━━━━━━`;

    await conn.sendMessage(from, { text }, { edit: msg.key });
});
