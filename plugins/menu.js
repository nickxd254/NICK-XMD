import config from '../config.cjs';

const menu = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "menu" && cmd !== "help") return;

  try {
    const pushName = m.pushName || "User";
    const date = new Date().toLocaleDateString();

    let menuText = `
*々 ${config.BOT_NAME || 'GEMINI'} BOT 々*

*👋 Hello, ${pushName}*
*📅 Date:* ${date}
*🚀 Prefix:* ${prefix}

*┌──⊷「 SYSTEM 」*
*│* ⌬ ${prefix}ping
*│* ⌬ ${prefix}uptime
*│* ⌬ ${prefix}runtime
*└──────────────⊷*

*┌──⊷「 MEDIA 」*
*│* ⌬ ${prefix}vv
*│* ⌬ ${prefix}viewonce
*└──────────────⊷*

*┌──⊷「 INFO 」*
*│* ⌬ ${prefix}owner
*│* ⌬ ${prefix}script
*└──────────────⊷*

_Powered by Gemini 3 Flash_`;

    // Sending the menu with a context info "ad" style (if your lib supports it)
    await gss.sendMessage(m.from, { 
        text: menuText,
        contextInfo: {
            externalAdReply: {
                title: "SYSTEM ACTIVE",
                body: "Select a command below",
                thumbnailUrl: "https://i.imgur.com/your-image.jpg", // Add a real URL here
                sourceUrl: "https://github.com/",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });

  } catch (err) {
    console.error("MENU STYLE ERROR:", err);
    m.reply("❌ Style error:\n" + err.message);
  }
};

export default menu;
