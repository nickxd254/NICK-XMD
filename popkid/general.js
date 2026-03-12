const { pmd, commands, monospace, formatBytes } = require("../pop"),
      fs = require('fs'), 
      axios = require('axios'),
      BOT_START_TIME = Date.now(),
      { totalmem: totalMemoryBytes, 
      freemem: freeMemoryBytes } = require('os'),
      moment = require('moment-timezone'), 
      more = String.fromCharCode(8206), 
      readmore = more.repeat(4001),
      { downloadContentFromMessage } = require('gifted-baileys'),
      ram = `${formatBytes(freeMemoryBytes)}/${formatBytes(totalMemoryBytes)}`;

// ==========================================
// 1. MAIN MENU COMMAND
// ==========================================
pmd({
  pattern: "menu",
  aliases: ["help", "allmenu", "mainmenu"],
  react: "🙊",
  category: "general",
  description: "Fetch bot main menu",
}, async (from, Popkid, conText) => {
  const { mek, sender, react, pushName, botPic, botName, botFooter, timeZone, botPrefix, newsletterJid } = conText;

  const currentTime = moment().tz(timeZone);
  const date = currentTime.format("DD/MM/YYYY");
  const time = currentTime.format("HH:mm:ss");

  const hour = currentTime.hour();
  let greeting;
  if (hour >= 5 && hour < 12) greeting = "Good Morning 🌅";
  else if (hour >= 12 && hour < 18) greeting = "Good Afternoon ☀️";
  else if (hour >= 18 && hour < 22) greeting = "Good Evening 🌆";
  else greeting = "Good Night 😴";

  const totalCommands = commands.filter(cmd => cmd.pattern).length;

  const categorized = commands.reduce((menu, cmd) => {
    if (cmd.pattern && !cmd.dontAddCommandList) {
      const cat = cmd.category ? cmd.category.toUpperCase() : "GENERAL";
      if (!menu[cat]) menu[cat] = [];
      menu[cat].push(cmd.pattern);
    }
    return menu;
  }, {});

  let menuContent = `
*┌─❖*
*│${botName.toUpperCase()}*
*└┬❖*
   *│${greeting}*
   *└────────┈❖*
▬▬▬▬▬▬▬▬▬▬
> 🕵️ᴜsᴇʀ ɴᴀᴍᴇ: ${pushName}💜
> 📅ᴅᴀᴛᴇ: ${date}
> ⏰ᴛɪᴍᴇ: ${time}
> ⭐ᴛᴏᴛᴀʟ ᴄᴍᴅꜱ: ${totalCommands}
▬▬▬▬▬▬▬▬▬▬
${readmore}`.trim();

  const sortedCategories = Object.keys(categorized).sort();
  for (const category of sortedCategories) {
    menuContent += `\n\n*╭─❖ ${category} MENU ❖*`;
    const sortedCmds = categorized[category].sort();
    sortedCmds.forEach(cmd => {
      menuContent += `\n*│❍⁠⁠ ${botPrefix}${cmd}*`;
    });
    menuContent += `\n*╰──────────────❖*`;
  }

  menuContent += `\n\n*┌─❖*\n*│${botName.toUpperCase()} BOT*\n*└──────────────❖*`;

  await Popkid.sendMessage(from, {
    image: { url: botPic },
    caption: `${menuContent}\n\n> *${botFooter}*`,
    contextInfo: {
      mentionedJid: [sender],
      forwardingScore: 5,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: newsletterJid,
        newsletterName: botName,
        serverMessageId: 143
      }
    }
  }, { quoted: mek });
  await react("✅");
});

// ==========================================
// 2. RETURN COMMAND
// ==========================================
pmd({
  pattern: "return",
  aliases: ['details', 'det', 'ret'],
  react: "⚡",
  category: "owner",
  description: "Displays the full raw quoted message.",
}, async (from, Popkid, conText) => {
  const { mek, reply, react, quotedMsg, isSuperUser, botName, newsletterJid } = conText;
  if (!isSuperUser) return reply(`Owner Only Command!`);
  if (!quotedMsg) return reply(`Please reply to/quote a message`);

  try {
    const jsonString = JSON.stringify(quotedMsg, null, 2);
    const chunks = jsonString.match(/[\s\S]{1,10000}/g) || [];
    for (const chunk of chunks) {
      await Popkid.sendMessage(from, {
        text: `\`\`\`\n${chunk}\n\`\`\``,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 },
        },
      }, { quoted: mek });
      await react("✅");
    }
  } catch (error) {
    await reply(`❌ Error processing message.`);
  }
});

// ==========================================
// 3. PING COMMAND
// ==========================================
pmd({ 
  pattern: "ping",
  react: "⚡",
  category: "general",
  description: "Check bot response speed",
}, async (from, Popkid, conText) => {
  const { mek, react, newsletterJid, botName } = conText;
  const startTime = Date.now();
  await Popkid.sendMessage(from, { 
    text: "Pinging...", 
    contextInfo: { 
      forwardingScore: 5, 
      isForwarded: true, 
      forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 }
    }
  }, { quoted: mek });
  const latency = Date.now() - startTime;
  await Popkid.sendMessage(from, { text: `⚡ Pong: ${latency}ms` }, { quoted: mek });
  await react("✅");
});

// ==========================================
// 4. UPTIME COMMAND
// ==========================================
pmd({ 
  pattern: "uptime", 
  react: "⏳",
  category: "general",
  description: "Check bot uptime status.",
}, async (from, Popkid, conText) => {
  const { mek, react, newsletterJid, botName } = conText;
  const uptimeMs = Date.now() - BOT_START_TIME;
  const s = Math.floor((uptimeMs / 1000) % 60);
  const m = Math.floor((uptimeMs / (1000 * 60)) % 60);
  const h = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
  const d = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

  await Popkid.sendMessage(from, {
    text: `⏱️ Uptime: ${d}d ${h}h ${m}m ${s}s`,
    contextInfo: {
      forwardingScore: 5,
      isForwarded: true,
      forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 }
    }
  }, { quoted: mek });
  await react("✅");
});

// ==========================================
// 5. REPO COMMAND
// ==========================================
pmd({ 
  pattern: "repo", 
  aliases: ['sc', 'script'],
  react: "💜",
  category: "general",
  description: "Fetch bot script.",
}, async (from, Popkid, conText) => {
  const { mek, sender, react, pushName, botPic, botName, ownerName, newsletterJid, popkidRepo } = conText;
  try {
    const response = await axios.get(`https://api.github.com/repos/${popkidRepo}`);
    const { name, forks_count, stargazers_count, created_at, updated_at } = response.data;
    const messageText = `Hello *_${pushName}_,*\nThis is *${botName}*\n\n*ʀᴇᴘᴏ ʟɪɴᴋ:* https://github.com/${popkidRepo}\n\n*❲❒❳ ɴᴀᴍᴇ:* ${name}\n*❲❒❳ sᴛᴀʀs:* ${stargazers_count}\n*❲❒❳ ғᴏʀᴋs:* ${forks_count}\n*❲❒❳ ᴄʀᴇᴀᴛᴇᴅ ᴏɴ:* ${new Date(created_at).toLocaleDateString()}\n*❲❒❳ ʟᴀsᴛ ᴜᴘᴅᴀᴛᴇᴅ:* ${new Date(updated_at).toLocaleDateString()}`;

    await Popkid.sendMessage(from, {
      image: { url: botPic },
      caption: messageText,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: { newsletterJid, newsletterName: botName, serverMessageId: 143 }
      }
    }, { quoted: mek });
    await react("✅");
  } catch (e) { console.error(e); }
});

// ==========================================
// 6. SAVE COMMAND
// ==========================================
pmd({
  pattern: "save",
  aliases: ['sv', 's', 'sav', '.'],
  react: "⚡",
  category: "tools",
  description: "Save messages to DM.",
}, async (from, Popkid, conText) => {
  const { mek, reply, react, sender, isSuperUser, getMediaBuffer } = conText;
  if (!isSuperUser) return reply(`❌ Owner Only Command!`);
  const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quotedMsg) return reply(`⚠️ Please reply to a message.`);

  try {
    let mediaData;
    if (quotedMsg.imageMessage) {
      mediaData = { image: await getMediaBuffer(quotedMsg.imageMessage, "image"), caption: quotedMsg.imageMessage.caption || "" };
    } else if (quotedMsg.videoMessage) {
      mediaData = { video: await getMediaBuffer(quotedMsg.videoMessage, "video"), caption: quotedMsg.videoMessage.caption || "" };
    } else if (quotedMsg.audioMessage) {
      mediaData = { audio: await getMediaBuffer(quotedMsg.audioMessage, "audio"), mimetype: "audio/mp4" };
    } else if (quotedMsg.stickerMessage) {
      mediaData = { sticker: await getMediaBuffer(quotedMsg.stickerMessage, "sticker") };
    } else if (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text) {
      mediaData = { text: quotedMsg.conversation || quotedMsg.extendedTextMessage.text };
    } else {
      return reply(`❌ Unsupported type.`);
    }
    await Popkid.sendMessage(sender, mediaData, { quoted: mek });
    await react("✅");
  } catch (error) {
    await reply(`❌ Failed to save.`);
  }
});
