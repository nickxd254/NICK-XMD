const { cmd } = require('../command');

cmd({
    pattern: "speed",
    desc: "Advanced speed test.",
    category: "main",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    const start = new Date().getTime();
    const msg = await reply("*Running speed test...*");

    let results = [];
    for (let i = 0; i < 3; i++) {
        let s = new Date().getTime();
        let e = new Date().getTime();
        results.push(e - s);
    }

    const end = new Date().getTime();
    const total = end - start;

    const text = `
🚀 *SPEED TEST RESULTS*
━━━━━━━━━━━━━━━
⚡ Response: ${total}ms
📊 Stability: ${results.join("ms | ")}ms
━━━━━━━━━━━━━━━`;

    await conn.sendMessage(from, { text }, { edit: msg.key });
});
