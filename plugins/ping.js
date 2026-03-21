const { cmd } = require('../command');

cmd({
    pattern: "ping",
    desc: "Check bot response speed.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    const start = new Date().getTime();
    const msg = await reply("*Checking Speed...*");
    const end = new Date().getTime();
    const latency = end - start;
    await conn.sendMessage(from, { text: `*⚡ 𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗟𝗮𝘁𝗲𝗻𝗰𝘆:* ${latency}ms` }, { edit: msg.key });
});
