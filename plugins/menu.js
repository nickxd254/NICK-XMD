const config = require('../config');
const os = require('os');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');

// Helper: Formats bytes to MB/GB
const formatSize = (bytes) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + 'GB';
    return (bytes / 1048576).toFixed(1) + 'MB';
};

// Helper: Simple Uptime
const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
};

cmd({
    pattern: 'menu',
    alias: ['help', 'allmenu', 'list'],
    react: '📜',
    category: 'main',
    filename: __filename,
    desc: 'Show NICK-XMD Main Menu'
}, async (conn, mek, m, { from, pushName, reply }) => {
    try {
        const timeZone = 'Africa/Nairobi';
        const date = moment.tz(timeZone).format('DD/MM/YYYY');
        const time = moment.tz(timeZone).format('HH:mm:ss');
        const uptime = formatUptime(process.uptime());
        const ram = `${formatSize(os.totalmem() - os.freemem())} / ${formatSize(os.totalmem())}`;
        
        // Group Commands by Category
        const categories = {};
        commands.forEach(command => {
            if (!command.dontAdd && command.category && command.pattern) {
                const cat = command.category.toUpperCase();
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(command.pattern);
            }
        });

        // Construct Header
        let menuText = `╔══════════════════╗
║ 🤖 *𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗠𝗘𝗡𝗨*
╠══════════════════╣
║ 👤 *User:* ${pushName}
║ 📅 *Date:* ${date}
║ ⏰ *Time:* ${time}
║ 🕒 *Uptime:* ${uptime}
║ 📟 *RAM:* ${ram}
║ 🔑 *Prefix:* ${config.PREFIX}
║ 🌍 *Mode:* ${config.MODE.toUpperCase()}
╚══════════════════╝

*𝖢𝗈𝗆𝗆𝖺𝗇𝖽 𝖫𝗂𝗌𝗍 🔽*`;

        // Sort and add categories
        Object.keys(categories).sort().forEach(cat => {
            menuText += `\n\n╔══⊷ *${cat}* 💠`;
            categories[cat].sort().forEach(cmdName => {
                menuText += `\n║ 🔹 ${config.PREFIX}${cmdName}`;
            });
            menuText += `\n╚═════════════════⊷`;
        });

        menuText += `\n\n> *${config.BOT_NAME || 'NICK-XMD'}* © 2026 🇰🇪`;

        // Use Catbox or Placeholder if local image fails
        const menuImg = "https://files.catbox.moe/rw2g9x.jpg"; 

        await conn.sendMessage(from, {
            image: { url: menuImg },
            caption: menuText,
            contextInfo: {
                externalAdReply: {
                    title: "𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗩𝟭",
                    body: "Created by Nick",
                    thumbnailUrl: menuImg,
                    sourceUrl: "https://whatsapp.com/channel/0029VacgxK96hENmSRMRxx1r",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Menu Error:", e);
        reply("❌ Error generating menu: " + e.message);
    }
});
