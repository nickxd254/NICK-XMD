import fs from 'fs';
import path from 'path';
import config from '../config.cjs';

export default async function(Matrix, m, { command, isCmd, from }) {
    if (!isCmd || (command !== 'menu' && command !== 'help')) return;

    const pluginsDir = path.join(process.cwd(), 'plugins');
    
    // 1. Scan the folder for all .js files
    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));

    // 2. Format the list (removing the '.js' extension for a clean look)
    let menuText = `✨ *${config.BOT_NAME || 'NICK-XMD'} MENU* ✨\n\n`;
    menuText += `👤 *User:* ${m.pushName || 'Guest'}\n`;
    menuText += `📅 *Date:* ${new Date().toLocaleDateString()}\n`;
    menuText += `🛠️ *Prefix:* [ ${config.PREFIX} ]\n\n`;
    menuText += `📜 *AVAILABLE COMMANDS* 📜\n`;

    files.forEach((file, index) => {
        const cmdName = file.replace('.js', '');
        menuText += `  ${index + 1}. ${config.PREFIX}${cmdName}\n`;
    });

    menuText += `\n*Total Plugins:* ${files.length}\n`;
    menuText += `_Powered by Nick-XMD Base_`;

    // 3. Send the menu with a nice image (using your Catbox link)
    await Matrix.sendMessage(from, { 
        image: { url: "https://files.catbox.moe/kiy0hl.jpg" },
        caption: menuText,
        contextInfo: {
            externalAdReply: {
                title: "NICK-XMD COMMAND CENTER",
                body: "Auto-Generated Menu",
                mediaType: 1,
                sourceUrl: "https://github.com/nickxd254/NICK-XMD",
                thumbnailUrl: "https://files.catbox.moe/kiy0hl.jpg"
            }
        }
    }, { quoted: m });
}
