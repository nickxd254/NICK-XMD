import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../config.cjs';
import axios from 'axios';

// Memory Calculations
const totalMemoryBytes = os.totalmem();
const freeMemoryBytes = os.freemem();
const byteToMB = 1 / (1024 * 1024);

function formatBytes(bytes) {
  return (bytes * byteToMB).toFixed(2) + ' MB';
}

const menu = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const mode = config.MODE === 'public' ? 'ᴘᴜʙʟɪᴄ' : 'ᴘʀɪᴠᴀᴛᴇ';

  // Real-time Uptime
  const uptime = process.uptime();
  const day = Math.floor(uptime / (24 * 3600)); 
  const hours = Math.floor((uptime % (24 * 3600)) / 3600); 
  const minutes = Math.floor((uptime % 3600) / 60); 

  // Dynamic Greeting
  const time2 = moment().tz("Asia/Colombo").format("HH:mm:ss");
  let pushwish = "ɢᴏᴏᴅ ɴɪɢʜᴛ 🌌";
  if (time2 < "12:00:00") pushwish = `ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ 🌄`;
  else if (time2 < "17:00:00") pushwish = `ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ 🌅`;
  else if (time2 < "20:00:00") pushwish = `ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ 🌃`;

  const validCommands = ['list', 'help', 'menu', 'allmenu'];

  if (validCommands.includes(cmd)) {
    const readMore = String.fromCharCode(8206).repeat(4001);
    const mainMenu = `
╔═══ 📥 NICK-XMD ᴠ3 📥 ═══╗
║ 👤 ᴏᴡɴᴇʀ: ${config.OWNER_NAME}
║ 🤖 ʙᴏᴛ: ${config.BOT_NAME}
║ ⚙️ ᴍᴏᴅᴇ: ${mode}
║ ⏳ ᴜᴘᴛɪᴍᴇ: ${day}ᴅ ${hours}ʜ ${minutes}ᴍ
║ 📟 ᴘʟᴀᴛꜰᴏʀᴍ: ${os.platform()}
║ 🚀 ʀᴀᴍ: ${formatBytes(freeMemoryBytes)}
╚══════════════════════╝

${pushwish} *${m.pushName}*!
${readMore}
┏━━〔 ᴅᴏᴡɴʟᴏᴀᴅᴇʀ 〕━┈⊷
┃ 📥 ᴀᴘᴋ
┃ 📥 ꜰᴀᴄᴇʙᴏᴏᴋ
┃ 📥 ɪɴsᴛᴀɢʀᴀᴍ
┃ 📥 ᴛɪᴋᴛᴏᴋ
┃ 📥 ᴍᴇᴅɪᴀꜰɪʀᴇ
┃ 📥 ɢᴅʀɪᴠᴇ
┃ 📥 ᴘɪɴᴛᴇʀᴇsᴛᴅʟ
┃ 📥 ɢɪᴛᴄʟᴏɴᴇ
┃ 📥 ᴘʟᴀʏ
┃ 📥 sᴏɴɢ
┃ 📥 ᴠɪᴅᴇᴏ
┃ 📥 ʏᴛs
┃ 📥 ʏᴛᴍᴘ3
┃ 📥 ʏᴛᴍᴘ4
┃ 📥 ʏᴛᴍᴘ3ᴅᴏᴄ
┃ 📥 ʏᴛᴍᴘ4ᴅᴏᴄ
┗━━━━━━━━━━━━┈⊷

┏━━〔 ᴀɪ ᴄʜᴀᴛ 〕━┈⊷
┃ 🤖 ᴀɪ
┃ 🤖 ɢᴘᴛ
┃ 🤖 ɢᴇᴍɪɴɪ
┃ 🤖 ʙᴏᴛ
┃ 🤖 ᴄʜᴀᴛʙᴏᴛ
┃ 🤖 ʟʏᴅᴇᴀ
┃ 🤖 ᴅᴀʟʟᴇ
┃ 🤖 ʀᴇᴍɪɴɪ
┃ 🤖 ɪᴍᴀɢɪɴᴇ
┃ 🤖 ᴜᴘsᴄᴀʟᴇ
┗━━━━━━━━━━━━┈⊷

┏━━〔 ɢʀᴏᴜᴘ 〕━┈⊷
┃ 👥 ʟɪɴᴋɢʀᴏᴜᴘ
┃ 👥 sᴇᴛᴘᴘɢᴄ
┃ 👥 sᴇᴛɴᴀᴍᴇ
┃ 👥 sᴇᴛᴅᴇsᴄ
┃ 👥 ɢʀᴏᴜᴘ
┃ 👥 ᴡᴇʟᴄᴏᴍᴇ
┃ 👥 ᴀᴅᴅ
┃ 👥 ᴋɪᴄᴋ
┃ 👥 ʜɪᴅᴇᴛᴀɢ
┃ 👥 ᴛᴀɢᴀʟʟ
┃ 👥 ᴛᴀɢᴀᴅᴍɪɴ
┃ 👥 ᴀɴᴛɪʟɪɴᴋ
┃ 👥 ᴀɴᴛɪʙᴏᴛ
┃ 👥 ᴀɴᴛɪᴅᴇʟᴇᴛᴇ
┃ 👥 ᴘʀᴏᴍᴏᴛᴇ
┃ 👥 ᴅᴇᴍᴏᴛᴇ
┃ 👥 ɢᴇᴛʙɪᴏ
┗━━━━━━━━━━━━┈⊷

┏━━〔 sᴇᴀʀᴄʜ 〕━┈⊷
┃ 🔍 ɢᴏᴏɢʟᴇ
┃ 🔍 ɢɪᴍᴀɢᴇ
┃ 🔍 ᴘɪɴᴛᴇʀᴇsᴛ
┃ 🔍 ᴡᴀʟʟᴘᴀᴘᴇʀ
┃ 🔍 ᴡɪᴋɪᴍᴇᴅɪᴀ
┃ 🔍 ʏᴛsᴇᴀʀᴄʜ
┃ 🔍 ʟʏʀɪᴄs
┃ 🔍 ɪᴍᴅʙ
┃ 🔍 ʀɪɴɢᴛᴏɴᴇ
┃ 🔍 ᴡᴇᴀᴛʜᴇʀ
┃ 🔍 ɴᴇᴡs
┗━━━━━━━━━━━━┈⊷

┏━━〔 ᴄᴏɴᴠᴇʀᴛᴇʀ 〕━┈⊷
┃ 🔄 ᴀᴛᴛᴘ
┃ 🔄 ᴀᴛᴛᴘ2
┃ 🔄 sᴛɪᴄᴋᴇʀ
┃ 🔄 ᴇʙɪɴᴀʀʏ
┃ 🔄 ᴅʙɪɴᴀʀʏ
┃ 🔄 ᴛᴏᴜʀʟ
┃ 🔄 ᴇᴍᴏᴊɪᴍɪx
┃ 🔄 ᴍᴘ3
┃ 🔄 ᴛᴏᴀᴜᴅɪᴏ
┃ 🔄 ᴛᴏɪᴍɢ
┃ 🔄 ʙʟᴜʀʀᴇᴅ
┃ 🔄 ᴄɪʀᴄʟᴇ
┗━━━━━━━━━━━━┈⊷

┏━━〔 ᴇᴄᴏɴᴏᴍʏ 〕━┈⊷
┃ 💰 ʙᴀʟᴀɴᴄᴇ
┃ 💰 ᴅᴀɪʟʏ
┃ 💰 ᴇᴀʀɴ
┃ 💰 ᴅᴇᴘᴏsɪᴛ
┃ 💰 ᴡɪᴛʜᴅʀᴀᴡ
┃ 💰 ᴛʀᴀɴsꜰᴇʀ
┃ 💰 ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ
┃ 💰 ᴡᴀʟʟᴇᴛ
┗━━━━━━━━━━━━┈⊷

┏━━〔 ᴀɴɪᴍᴇ & ɴsꜰᴡ 〕━┈⊷
┃ 🔞 ᴡᴀɪꜰᴜ
┃ 🔞 ɴᴇᴋᴏ
┃ 🔞 sʜɪɴᴏʙᴜ
┃ 🔞 ᴍᴇɢᴜᴍɪɴ
┃ 🔞 ᴄᴏsᴘʟᴀʏ
┃ 🔞 ʜᴜsʙᴜ
┃ 🔞 ʙʟᴏᴡᴊᴏʙ
┃ 🔞 ᴘᴜssʏ
┃ 🔞 ᴍɪʟꜰ
┃ 🔞 ʏᴜʀɪ
┃ 🔞 ʜᴇɴᴛᴀɪ
┃ 🔞 ᴛʀᴀᴘ
┗━━━━━━━━━━━━┈⊷

┏━━〔 sᴛᴀʟᴋᴇʀ 〕━┈⊷
┃ 🕵️ ᴛʀᴜᴇᴄᴀʟʟᴇʀ
┃ 🕵️ ɪɴsᴛᴀsᴛᴀʟᴋ
┃ 🕵️ ɢɪᴛʜᴜʙsᴛᴀʟᴋ
┃ 🕵️ ᴛɪᴋᴛᴏᴋsᴛᴀʟᴋ
┃ 🕵️ ɴᴘᴍsᴛᴀʟᴋ
┃ 🕵️ ᴛᴡɪᴛᴛᴇʀsᴛᴀʟᴋ
┗━━━━━━━━━━━━┈⊷

┏━━〔 ᴛᴏᴏʟs 〕━┈⊷
┃ 🛠️ ᴄᴀʟᴄᴜʟᴀᴛᴏʀ
┃ 🛠️ ᴛᴇᴍᴘᴍᴀɪʟ
┃ 🛠️ ᴄʜᴇᴄᴋᴍᴀɪʟ
┃ 🛠️ ᴛʀᴛ
┃ 🛠️ ᴛᴛs
┃ 🛠️ ss
┃ 🛠️ ǫʀ
┃ 🛠️ ʀᴇᴀᴅǫʀ
┃ 🛠️ ᴘʀᴏꜰɪʟᴇ
┗━━━━━━━━━━━━┈⊷

┏━━〔 ᴏᴡɴᴇʀ 〕━┈⊷
┃ 👑 ᴊᴏɪɴ
┃ 👑 ʟᴇᴀᴠᴇ
┃ 👑 ʙʟᴏᴄᴋ
┃ 👑 ᴜɴʙʟᴏᴄᴋ
┃ 👑 sᴇᴛᴘᴘʙᴏᴛ
┃ 👑 ᴀɴᴛɪᴄᴀʟʟ
┃ 👑 sᴇᴛsᴛᴀᴛᴜs
┃ 👑 ᴀᴜᴛᴏᴛʏᴘɪɴɢ
┃ 👑 ᴀᴜᴛᴏʀᴇᴀᴅ
┃ 👑 ᴀᴅᴅᴘʀᴇᴍɪᴜᴍ
┃ 👑 ᴊɪᴅ
┃ 👑 ʀᴇsᴛᴀʀᴛ
┃ 👑 ᴜᴘᴅᴀᴛᴇ
┗━━━━━━━━━━━━┈⊷

┏━━〔 ᴍᴀɪɴ 〕━┈⊷
┃ ⚡ ᴘɪɴɢ
┃ ⚡ ᴀʟɪᴠᴇ
┃ ⚡ ᴏᴡɴᴇʀ
┃ ⚡ ᴍᴇɴᴜ
┃ ⚡ ɪɴꜰᴏʙᴏᴛ
┃ ⚡ ᴜᴘᴛɪᴍᴇ
┗━━━━━━━━━━━━┈⊷

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ NICK-XMD ᴠ3
`;

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

    await Matrix.sendMessage(m.from, {
      image: menuImage,
      caption: mainMenu,
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
            body: "sᴛʏʟɪsʜ ᴡʜᴀᴛsᴀᴘᴘ ᴇxᴘᴇʀɪᴇɴᴄᴇ",
            thumbnailUrl: "https://files.catbox.moe/yr339d.jpg",
            sourceUrl: "https://whatsapp1r",
            mediaType: 1,
            renderLargerThumbnail: false
        }
      }
    }, {
      quoted: m
    });

    await Matrix.sendMessage(m.from, {
      audio: { url: 'https://github.com/XdTechPro/KHAN-DATA/raw/refs/heads/main/autovoice/menunew.m4a' },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m });
  }
};

export default menu;
