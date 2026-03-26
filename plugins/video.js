/**
 * NICK-XMD Video Plugin
 * Creator: Popkid (Kenya)
 * Feature: YouTube MP4 Downloader with Retry Engine
 */

const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
const API_KEY = 'xbps-install-Syu';

// Helper for retry logic
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const downloadWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data } = await axios.get(DL_API, {
                params: { apiKey: API_KEY, format: '360', url }, 
                timeout: 90000
            });
            if (data?.data?.downloadUrl) return data.data;
            throw new Error('No download URL');
        } catch (err) {
            if (i === retries - 1) throw err;
            await wait(5000); // Wait 5s before retrying
        }
    }
    throw new Error('All download attempts failed');
};

cmd({
    pattern: "video",
    alias: ["ytmp4", "vid"],
    desc: "Download YouTube videos with retry logic",
    category: "download",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, text, reply }) => {
    try {
        if (!text) return reply("🎬 *ᴜꜱᴀɢᴇ:* .video <song name or YouTube link>");

        let videoUrl, videoTitle, videoThumbnail;
        const query = text.trim();

        // 1. Search / URL Logic
        if (query.startsWith('http')) {
            await conn.sendMessage(from, { react: { text: "🔍", key: mek.key }});
            const search = await yts(query);
            const vid = search.videos[0];
            videoUrl = query;
            videoTitle = vid ? vid.title : 'YouTube Video';
            videoThumbnail = vid ? vid.thumbnail : 'https://files.catbox.moe/j9ia5c.png';
        } else {
            await conn.sendMessage(from, { react: { text: "🔍", key: mek.key }});
            const { videos } = await yts(query);
            if (!videos?.length) return reply("❌ *ɴᴏ ʀᴇꜱᴜʟᴛꜱ ꜰᴏᴜɴᴅ!*");
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
        }

        // 2. Send Preview Card
        const preview = `╔══════════════════╗\n` +
                        `║ 🎬 *𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗩𝗜𝗗𝗘𝗢* \n` +
                        `╠══════════════════╣\n` +
                        `║ 📌 *ᴛɪᴛʟᴇ:* ${videoTitle}\n` +
                        `║ ⚙️ *ᴇɴɢɪɴᴇ:* Retry Enabled\n` +
                        `╚══════════════════╝\n\n` +
                        `⏳ _ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ... ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ_`;

        await conn.sendMessage(from, {
            image: { url: videoThumbnail || 'https://files.catbox.moe/j9ia5c.png' },
            caption: preview
        }, { quoted: mek });

        // 3. Execute Download with Retry Engine
        const videoData = await downloadWithRetry(videoUrl);

        // 4. Send Video File
        await conn.sendMessage(from, {
            video: { url: videoData.downloadUrl },
            mimetype: 'video/mp4',
            fileName: `${videoTitle}.mp4`,
            caption: `✅ *${videoTitle}*\n\n> 𝖯𝗈𝗉𝗄𝗂𝖽 𝖬𝖽 𝖤𝗇𝗀ɪɴ𝖾 🇰🇪`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key }});

    } catch (err) {
        console.error("Video Error:", err);
        reply(`❌ *ᴅᴏᴡɴʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ:* ᴀᴘɪ ɪꜱ ᴄᴜʀʀᴇɴᴛʟʏ ᴏᴠᴇʀʟᴏᴀᴅᴇᴅ ᴏʀ ᴛɪᴍᴇᴅ ᴏᴜᴛ. ᴛʀʏ ᴀɢᴀɪɴ.`);
    }
});
