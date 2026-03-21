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
        let menu = `✨ *𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧* ✨\n\n`;
        menu += `👤 *User:* ${pushname}\n`;
        menu += `🕒 *Uptime:* ${runtime(process.uptime())}\n`;
        menu += `━━━━━━━━━━━━━━━\n`;

        const categories = {};
        commands.forEach(command => {
            if (!categories[command.category]) categories[command.category] = [];
            categories[command.category].push(command.pattern);
        });

        for (const category in categories) {
            menu += `\n*◈ ${category.toUpperCase()} ◈*\n`;
            menu += categories[category].map(cmd => `  ↳ .${cmd}`).join('\n') + '\n';
        }

        menu += `\n━━━━━━━━━━━━━━━\n_Powered by Popkid Tech_`;

        await conn.sendMessage(from, { 
            image: { url: "https://files.catbox.moe/j9ia5c.png" }, 
            caption: menu 
        }, { quoted: mek });
    } catch (e) {
        reply(`Error: ${e}`);
    }
});
