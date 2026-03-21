const { cmd } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    desc: "Check if bot is online.",
    category: "main",
    react: "🛰️",
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {
    try {
        const aliveMsg = `*Ｈｅｌｌｏ ${pushname}* 👋

> 𝗜 𝗔𝗠 𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗩𝟭 🤖
_Your powerful WhatsApp assistant is active and running._

*⚡ Uptime:* ${runtime(process.uptime())}
*👨‍💻 Owner:* Nick (Kenya)
*⚙️ Prefix:* [ . ]

_Type .menu to explore my commands!_`;

        await conn.sendMessage(from, { 
            image: { url: `https://files.catbox.moe/j9ia5c.png` }, 
            caption: aliveMsg 
        }, { quoted: mek });
    } catch (e) {
        reply(`Error: ${e}`);
    }
});
