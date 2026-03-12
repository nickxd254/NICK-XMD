/**
 * join.js
 * Converted for Popkid-MD
 * Access: SuperUser/Creator Only
 */

const { pmd, isUrl } = require("../pop");

pmd({
    pattern: "join",
    aliases: ["joinme", "f_join"],
    react: "📬",
    category: "group",
    description: "Join a Group via Invite link",
}, async (from, Popkid, conText) => {
    const { 
        mek, q, args, reply, react, pushName, 
        isSuperUser, botName, newsletterJid, quotedMsg 
    } = conText;

    try {
        // 1. Access Control (Functionality Kept)
        if (!isSuperUser) {
            await react("❌");
            return reply("⚠️ *Access Denied*\n\nYou don't have permission to use this command. Only my *Creator* can perform this action.");
        }

        // 2. Input logic (Check Query or Quoted Message)
        let input = q || (quotedMsg ? (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text) : "");
        
        if (!input || !input.includes('chat.whatsapp.com/')) {
            await react("❌");
            return reply("📍 *Please provide a Group Link*️ 🖇️\n\n*Usage:* `.join <link>` or reply to a link.");
        }

        // 3. Extract Group Code
        const groupCode = input.split('chat.whatsapp.com/')[1].split(' ')[0];

        if (!groupCode) {
            return reply("❌ *Invalid Group Link* 🖇️\n\nMake sure it is a valid WhatsApp invite URL.");
        }

        // 4. Accept Invite
        await Popkid.groupAcceptInvite(groupCode);

        // 5. Stylish Success Message (Your Menu Style)
        const successText = `
*┌─❖*
*│${botName.toUpperCase()} JOINER*
*└┬❖*
   *│ENTRY SUCCESS*
   *└────────┈❖*
▬▬▬▬▬▬▬▬▬▬
> 🕵️ᴜsᴇʀ ɴᴀᴍᴇ: ${pushName}💜
> ✅sᴛᴀᴛᴜs: Joined Successfully
> 🖇️ʟɪɴᴋ: chat.whatsapp.com/${groupCode}
▬▬▬▬▬▬▬▬▬▬`.trim();

        await Popkid.sendMessage(from, { 
            text: successText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: newsletterJid,
                    newsletterName: botName,
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: `${botName} NETWORK`,
                    body: "Group Entry Authorization Granted",
                    mediaType: 1,
                    sourceUrl: "https://github.com/popkidmd",
                    thumbnailUrl: "https://files.catbox.moe/aapw1p.png",
                    renderLargerThumbnail: true,
                    showAdAttribution: true
                }
            }
        }, { quoted: mek });

        await react("✅");

    } catch (e) {
        await react("❌");
        console.error("[JOIN ERROR]", e);
        reply(`❌ *Error Occurred!!*\n\n*Details:* ${e.message || e}`);
    }
});
