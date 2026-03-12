const { pmd, more } = require("../pop");
const config = require("../config");

pmd({
    pattern: "tagall",
    aliases: ["everyone", "all"],
    react: "📣",
    category: "group",
    description: "Mention all members with a stylish header and newsletter style",
}, async (from, Popkid, conText) => {
    const { mek, sender, isGroup, q, reply, botFooter, botName } = conText;

    try {
        if (!isGroup) return reply("❌ *This command only works in groups!*");

        // Fetch group participants
        const groupMetadata = await Popkid.groupMetadata(from);
        const participants = groupMetadata.participants;

        let mentions = [];
        let tagMessage = `*╔═══════════════════╗*
*✨ ${config.BOT_NAME || '𝐏𝐎𝐏𝐊𝐈𝐃'} 𝐀𝐋𝐋 ✨*
*╚═══════════════════╝*

📢 *𝐀𝐧𝐧𝐨𝐮𝐧𝐜𝐞𝐦𝐞𝐧𝐭:* _${q ? q : 'Hey everyone, pay attention!'}_

👤 *𝐈𝐧𝐢𝐭𝐢𝐚𝐭𝐞𝐝 𝐛𝐲:* @${sender.split('@')[0]}
👥 *𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬:* ${participants.length}

*┌───⊷ 𝐆𝐑𝐎𝐔𝐏 𝐌𝐄𝐌𝐁𝐄𝐑𝐒*`;

        // Loop through participants to add to message and mention array
        for (let participant of participants) {
            tagMessage += `\n*│🔹 @${participant.id.split('@')[0]}*`;
            mentions.push(participant.id);
        }

        tagMessage += `\n*└──────────────⊷*\n\n> *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 ${config.OWNER_NAME || '𝐏𝐨𝐩𝐤𝐢𝐝'}🇰🇪*`;

        // Advanced Newsletter & External Ad Context
        const contextInfo = {
            mentionedJid: mentions, 
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: config.NEWSLETTER_JID || '120363423997837331@newsletter',
                newsletterName: config.OWNER_NAME || 'POPKID',
                serverMessageId: 143
            },
            externalAdReply: {
                title: "𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐍𝐄𝐓𝐖𝐎𝐑𝐊",
                body: "Group Management System",
                mediaType: 1,
                sourceUrl: config.NEWSLETTER_URL || "https://github.com/popkidmd",
                thumbnailUrl: "https://files.catbox.moe/aapw1p.png",
                renderLargerThumbnail: true,
                showAdAttribution: true
            }
        };

        // Send the tagged message
        await Popkid.sendMessage(from, { 
            image: { url: 'https://files.catbox.moe/aapw1p.png' }, 
            caption: tagMessage, 
            contextInfo: contextInfo
        }, { quoted: mek });

    } catch (err) {
        console.error("TAGALL ERROR:", err);
        reply("❌ *Failed to tag all members.*");
    }
});
