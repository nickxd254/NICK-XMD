import os from 'os';
import config from '../config.cjs';

const pingCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  if (!body.startsWith(prefix) || body.slice(prefix.length).split(" ")[0].toLowerCase() !== "ping") return;

  try {
    const start = Date.now();
    const latency = Date.now() - start;
    
    const pingStatus = `*ɴɪᴄᴋ xᴍᴅ sᴛᴀᴛᴜs*\n\n` +
                       `🚀 *ʟᴀᴛᴇɴᴄʏ:* ${latency}ᴍs\n` +
                       `💻 *ᴘʟᴀᴛꜰᴏʀᴍ:* ${os.platform()}\n` +
                       `⚙️ *ᴜᴘᴛɪᴍᴇ:* ${Math.floor(process.uptime() / 60)} ᴍɪɴᴜᴛᴇs\n\n` +
                       `_ɴɪᴄᴋ ʙᴏᴛ ɪs ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ_`;

    await Matrix.sendMessage(m.from, { 
      text: pingStatus,
      contextInfo: {
        mentionedJid: [m.sender]
      }
    }, { quoted: m });

  } catch (error) {
    console.error("PING ERROR:", error);
    m.reply("⚠️ *Error:* System check failed.");
  }
};

export default pingCmd;

