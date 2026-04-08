const { cmd } = require('../command');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

cmd({
    pattern: "vv",
    alias: ["viewonce", "reveal"],
    desc: "Reveal view-once image or video",
    category: "tools",
    react: "👁️",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const quoted =
            mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return reply("❌ Reply to a *view-once image or video*.");
        }

        // Handle view-once wrapper (Baileys v6+)
        const viewOnceWrapper =
            quoted.viewOnceMessageV2 ||
            quoted.viewOnceMessage ||
            null;

        // Extract the actual media message
        const mediaMessage =
            viewOnceWrapper?.message?.imageMessage ||
            viewOnceWrapper?.message?.videoMessage ||
            quoted.imageMessage ||
            quoted.videoMessage ||
            null;

        if (!mediaMessage) {
            return reply("❌ No image or video found in that message.");
        }

        // FIX 1: isImage/isVideo should check mimetype on mediaMessage directly
        // (mediaMessage IS the imageMessage/videoMessage object already)
        const mime = mediaMessage.mimetype || '';
        const isImage = mime.startsWith('image');
        const isVideo = mime.startsWith('video');

        if (!isImage && !isVideo) {
            return reply("❌ Unsupported media type: " + mime);
        }

        // FIX 2: viewOnce flag is on the wrapper, not on mediaMessage itself
        const isViewOnce =
            viewOnceWrapper !== null ||
            quoted.viewOnceMessageV2 !== undefined ||
            quoted.viewOnceMessage !== undefined;

        if (!isViewOnce) {
            return reply("❌ This is not a view-once media.");
        }

        // Random reaction
        const reactionEmojis = ['🔥','⚡','🚀','💨','🎯','🎉','🌟','💥','👁️'];
        const reactEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

        await conn.sendMessage(from, {
            react: { text: reactEmoji, key: mek.key }
        });

        // FIX 3: downloadContentFromMessage needs the correct message object
        // Pass mediaMessage directly with the right type
        const mediaType = isImage ? 'image' : 'video';
        const stream = await downloadContentFromMessage(mediaMessage, mediaType);

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (!buffer.length) {
            return reply("❌ Downloaded media is empty. The view-once may have expired.");
        }

        // Send revealed media (not view-once)
        await conn.sendMessage(from, {
            [mediaType]: buffer,
            mimetype: mime,
            caption: mediaMessage.caption || '👁️ *View-once revealed*',
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363289379419860@newsletter",
                    newsletterName: "nick",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("VV Command Error:", err);
        reply(`❌ Failed to reveal view-once media.\n\`${err.message}\``);
    }
});
