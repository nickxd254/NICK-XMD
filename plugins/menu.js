const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu",
    alias: ["list", "help"],
    desc: "Show all available commands.",
    category: "main",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {
    try {

        const totalCommands = commands.length;
        const totalCategories = [...new Set(commands.map(c => c.category))].length;
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        let menu = `
╭━━━〔 *NICK-XMD SYSTEM* 〕━━━⬣
┃ 👤 *User:* ${pushname}
┃ ⚡ *Mode:* Public
┃ 🧠 *Commands:* ${totalCommands}
┃ 📂 *Categories:* ${totalCategories}
┃ 🕒 *Uptime:* ${runtime(process.uptime())}
┃ 📅 *Date:* ${date}
┃ ⏰ *Time:* ${time}
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 *COMMAND PANEL* 〕━━━⬣`;

        const categories = {};
        commands.forEach(command => {
            if (!categories[command.category]) categories[command.category] = [];
            categories[command.category].push(command.pattern);
        });

        for (const category in categories) {
            menu += `

┃ ◈ *${category.toUpperCase()}*
┃ ───────────────`;

            menu += '\n' + categories[category]
                .map(cmd => `┃ ➤ .${cmd}`)
                .join('\n');
        }

        menu += `

╰━━━━━━━━━━━━━━━━━━⬣
✨ *Fast • Clean • Powerful*
🚀 _Powered by Popkid Tech_`;

        await conn.sendMessage(from, { 
            image: { url: "https://files.catbox.moe/4audtn.png" }, 
            caption: menu 
        }, { quoted: mek });

    } catch (e) {
        reply(`Error: ${e}`);
    }
});
