const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch');

cmd({
    pattern: "play",
    desc: "Download song from YouTube.",
    category: "download",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, reply, text }) => {
    try {
        if (!text) return reply("🎵 Give me a song name!");

        const msg = await reply("*🔍 Searching...*");

        const search = await yts(text);
        const video = search.videos[0];

        if (!video) return reply("❌ No results found!");

        // Example API (replace with your own if needed)
        const api = `https://api.vevioz.com/api/button/mp3/${video.videoId}`;
        
        const caption = `
🎵 *NICK-XMD PLAYER*
━━━━━━━━━━━━━━━
📀 Title: ${video.title}
⏱ Duration: ${video.timestamp}
👀 Views: ${video.views}
📡 Channel: ${video.author.name}
━━━━━━━━━━━━━━━
⬇️ Downloading audio...
`;

        await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption
        }, { edit: msg.key });

        await conn.sendMessage(from, {
            audio: { url: api },
            mimetype: "audio/mpeg",
            ptt: false
        }, { quoted: mek });

    } catch (e) {
        reply(`Error: ${e}`);
    }
});
