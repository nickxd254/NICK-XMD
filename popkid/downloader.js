const { pmd, PopkidApkDl } = require("../pop"),
       POPKID_DLS = require('gifted-dls'),
       popkidDls = new POPKID_DLS();

pmd({
    pattern: "ytv",
    category: "downloader",
    react: "📽",
    description: "Download Video from Youtube"
}, async (from, Popkid, conText) => {
    const { q, mek, reply, react, sender, botPic, botName, botFooter, newsletterUrl, newsletterJid, pmdJson, pmdBuffer, formatVideo, PopkidTechApi, PopkidApiKey } = conText;

    if (!q) {
        await react("❌");
        return reply("Please provide a YouTube URL");
    }

    if (!q.startsWith("https://youtu.be/") && !q.startsWith("https://www.youtube.com/") && !q.startsWith("https://youtube.com/")) {
        return reply("Please provide a valid YouTube URL!");
    }

    try {
        const searchResponse = await pmdJson(
            `${PopkidTechApi}/search/yts?apikey=${PopkidApiKey}&query=${encodeURIComponent(q)}`
        );
        const videoInfo = searchResponse.results[0];
        const infoMessage = {
            image: { url: videoInfo.thumbnail || botPic },
            caption: `> *${botName} 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n\n` +
                     `╭───────────────◆\n` +
                     `│⿻ *Title:* ${videoInfo.title}\n` +
                     `│⿻ *Duration:* ${videoInfo.timestamp}\n` +
                     `│⿻ *Viewers:* ${videoInfo.views}\n` +
                     `│⿻ *Uploaded:* ${videoInfo.ago}\n` +
                     `│⿻ *Artist:* ${videoInfo.author.name}\n` +
                     `╰────────────────◆\n\n` +
                     `⏱ *Session expires in 2 minutes*\n` +
                     `╭───────────────◆\n` +
                     `│Reply With:\n` +
                     `│1️⃣ To Download 360p\n` +
                     `│2️⃣ To Download 720p\n` +
                     `│3️⃣ To Download 1080p\n` +
                     `╰────────────────◆`,
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
        };
        const sentMessage = await Popkid.sendMessage(from, infoMessage, { quoted: mek });
        const messageId = sentMessage.key.id;
        const handleResponse = async (event) => {
            const messageData = event.messages[0];
            if (!messageData.message) return;
            
            const isReplyToPrompt = messageData.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
            if (!isReplyToPrompt) return;
            
            const userChoice = messageData.message.conversation || 
                              messageData.message.extendedTextMessage?.text;
            
            await react("⬇️");
            
            try {
                let quality;
                switch (userChoice.trim()) {
                    case "1": quality = 360; break;
                    case "2": quality = 720; break;
                    case "3": quality = 1080; break;
                    default:
                        return reply("Invalid option. Please reply with: 1, 2 or 3", messageData);
                }

                const downloadResult = await popkidDls.ytmp4(q, quality);
                const downloadUrl = downloadResult.result.download_url;
                const videoBuffer = await pmdBuffer(downloadUrl);
                
                if (videoBuffer instanceof Error) {
                    await react("❌");
                    return reply("Failed to download the video.", messageData);
                }
                
                const formattedVideo = await formatVideo(videoBuffer);
                await Popkid.sendMessage(from, {
                    video: formattedVideo,
                    mimetype: "video/mp4",
                }, { quoted: messageData });
                
                await react("✅");
            } catch (error) {
                console.error("Error processing video:", error);
                await react("❌");
                await reply("Failed to process video. Please try again.", messageData);
            }
        };
        const sessionTimeout = setTimeout(() => {
            Popkid.ev.off("messages.upsert", handleResponse);
        }, 120000); // 2 minutes

        Popkid.ev.on("messages.upsert", handleResponse);

    } catch (error) {
        console.error("YouTube download error:", error);
        await react("❌");
        return reply("An error occurred while processing your request. Please try again.");
    }
});
