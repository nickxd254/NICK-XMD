import axios from 'axios';
import fs from 'fs';
import os from 'os';
import config from '../config.cjs';

const pingCmd = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix) 
    ? body.slice(prefix.length).split(" ")[0].toLowerCase() 
    : "";

  if (cmd !== "ping") return;

  try {
    const start = Date.now();
    
    // Function to fetch image exactly like your menu script
    const getMenuImage = async () => {
      if (config.MENU_IMAGE && config.MENU_IMAGE.trim() !== '') {
        try {
          const response = await axios.get(config.MENU_IMAGE, { responseType: 'arraybuffer' });
          return Buffer.from(response.data, 'binary');
        } catch (error) {
          return fs.readFileSync('./media/zenor.jpeg');
        }
      } else {
        return fs.readFileSync('./media/zenor.jpeg');
      }
    };

    const menuImage = await getMenuImage();
    const latency = Date.now() - start;

    // Stylish Text Content
    const pingStatus = `*NICK-XMD sᴛᴀᴛᴜs*\n\n` +
                       `🚀 *ʟᴀᴛᴇɴᴄʏ:* ${latency}ᴍs\n` +
                       `💻 *ᴘʟᴀᴛꜰᴏʀᴍ:* ${os.platform()}\n` +
                       `⚙️ *ᴜᴘᴛɪᴍᴇ:* ${Math.floor(process.uptime() / 60)} ᴍɪɴᴜᴛᴇs\n\n` +
                       `_Nick'son  ʙᴏᴛ ɪs ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ_`;

    await Matrix.sendMessage(m.from, {
      image: menuImage,
      caption: pingStatus,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363289379419860@newsletter',
          newsletterName: "Nick's son ᴜᴘᴅᴀᴛᴇs",
          serverMessageId: 143
        },
        externalAdReply: {
          title: "NICK-XMD ᴏꜰꜰɪᴄɪᴀʟ",
          body: "sʏsᴛᴇᴍ ᴘᴇʀꜰᴏʀᴍᴀɴᴄᴇ ᴄʜᴇᴄᴋ",
          thumbnailUrl: "https://files.catbox.moe/yr339d.jpg",
          sourceUrl: "",
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error("PING ERROR:", error);
    m.reply("⚠️ *Error:* System check failed.");
  }
};

export default pingCmd;
