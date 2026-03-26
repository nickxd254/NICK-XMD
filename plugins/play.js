/**
 * NICK-XMD Play Plugin
 * Creator: Popkid (Kenya)
 * Feature: YouTube MP3 Downloader
 */

const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "play",
    alias: ["audio", "song", "iplay"],
    desc: "Download and play songs from YouTube",
    category: "download",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, text, isOwner, reply }) => {
    try {
        if (!text) return reply("🎵 *Usage:* .play <song name or YouTube link>");

        const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
        const API_KEY = 'xbps-install-Syu';

        let video;
        const query = text.trim();

        // 1. Search Logic
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            const search = await yts(query);
            video = search.videos[0] || { url: query, title: "YouTube Audio", thumbnail: 'https://files.catbox.moe/j9ia5c.png' };
        } else {
            await reply('🔍 *Searching for your song...*');
            const search = await yts(query);
            video = search.videos[0];
        }

        if (!video) return reply("❌ No results found!");

        // 2. Send Preview Info
        const previewText = `╔══════════════════╗
║ 🎧 *𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗣𝗟𝗔𝗬𝗘𝗥*
╠══════════════════╣
║ 📌 *Title:* ${video.title}
║ ⏱️ *Duration:* ${video.timestamp || 'N/A'}
║ 🔗 *Link:* ${video.url}
╚══════════════════╝

⏳ _Converting to MP3... please wait_`;

        await conn.sendMessage(from, {
            image: { url: video.thumbnail || video.image || 'https://files.catbox.moe/j9ia5c.png' },
            caption: previewText
        }, { quoted: mek });

        // 3. Download Logic with Retry/Timeout
        const getAudio = async (url) => {
            const response = await axios.get(DL_API, {
                params: { apiKey: API_KEY, format: 'mp3', url },
                timeout: 90000,
            });
            
            if (response.data && response.data.data && response.data.data.downloadUrl) {
                return response.data.data;
            }
            throw new Error('API could not generate a download link.');
        };

        const audioData = await getAudio(video.url);

        // 4. Send Audio File
        await conn.sendMessage(from, {
            audio: { url: audioData.downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: false 
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key }});

    } catch (err) {
        console.error("Play Error:", err);
        reply(`❌ *Download Failed:* ${err.message || "Request Timeout"}`);
    }
});
