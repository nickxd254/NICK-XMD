/**
 * NICK-XMD View Once Plugin
 * Creator: Popkid (Kenya)
 * Feature: Anti-ViewOnce / ViewOnce Downloader
 */

const { cmd } = require('../command');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

cmd({
    pattern: "vv",
    alias: ["retrive", "viewonce", "svv"],
    desc: "Download/Resend View Once media",
    category: "tools",
    react: "🔓",
    filename: __filename
},
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        // 1. Check if the quoted message is View Once
        const isViewOnce = quoted?.message?.viewOnceMessageV2 || quoted?.message?.viewOnceMessageV2Extension;
        
        if (!quoted || !isViewOnce) {
            return reply("❌ *Please reply to a View-Once Image or Video!*");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key }});

        // 2. Identify media type and extract message
        const type = Object.keys(quoted.message.viewOnceMessageV2.message)[0];
        const mediaMsg = quoted.message.viewOnceMessageV2.message[type];

        // 3. Download the media buffer
        const stream = await downloadContentFromMessage(mediaMsg, type.replace('Message', ''));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // 4. Stylish Header
        const caption = `╔══════════════════╗\n` +
                        `║ 🔓 *𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗩𝗩-𝗨𝗡𝗟𝗢𝗖𝗞* \n` +
                        `╠══════════════════╣\n` +
                        `║ 👤 *FROM:* @${quoted.sender.split('@')[0]}\n` +
                        `║ 📂 *TYPE:* ${type.replace('Message', '').toUpperCase()}\n` +
                        `╚══════════════════╝\n\n` +
                        `> ${mediaMsg.caption || "No Caption"}\n\n` +
                        `*𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪*`;

        // 5. Resend as normal media
        if (type === 'imageMessage') {
            await conn.sendMessage(from, { 
                image: buffer, 
                caption: caption,
                mentions: [quoted.sender]
            }, { quoted: mek });
        } else if (type === 'videoMessage') {
            await conn.sendMessage(from, { 
                video: buffer, 
                caption: caption,
                mentions: [quoted.sender]
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key }});

    } catch (err) {
        console.error("VV Error:", err);
        reply("❌ *Failed to unlock media.* The message might be too old or corrupted.");
    }
});
