const { cmd } = require('../command');
const os = require('os');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "system",
    alias: ["status", "botinfo"],
    desc: "Check bot system information.",
    category: "main",
    react: "📟",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        let status = `*🚀 𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢*

*✨ Runtime:* ${runtime(process.uptime())}
*📟 RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem / 1024 / 1024)}MB
*💻 Platform:* ${os.platform()}
*👥 Owner:* Nick
*📡 Host:* ${os.hostname()}

_NICK-XMD is running smoothly!_`;
        
        return await reply(status);
    } catch (e) {
        reply(`Error: ${e}`);
    }
});
