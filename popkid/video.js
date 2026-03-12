/**
 * yt-play-video.js
 * Optimized styling for Popkid-MD
 * Converted to work accurately in your base
 */

const { pmd } = require("../pop");
const axios = require("axios");
const yts = require("yt-search");

const BASE_URL = "https://noobs-api.top";

pmd({
  pattern: "video",
  aliases: ["pv", "v"],
  react: "🎬",
  category: "download",
  description: "Play video from YouTube",
}, async (from, Popkid, conText) => {
  const { mek, q, args, reply, react, botName, newsletterJid } = conText;

  const query = q || args.join(" ");
  if (!query) return reply("Please provide a video name.");

  try {
    // 1. YouTube Search
    const search = await yts(query);
    const video = (search && (search.videos && search.videos[0])) || (search.all && search.all[0]);
    if (!video) return reply("No results found.");

    const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, "");
    const fileName = `${safeTitle}.mp4`;
    
    // 2. Fetch using API (Format: mp4)
    const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId || video.url)}&format=mp4`;
    const { data } = await axios.get(apiURL);
    
    if (!data || !data.downloadLink) return reply("Failed to get download link.");

    // Helper for professional Context Info
    const contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: newsletterJid,
        newsletterName: botName,
        serverMessageId: -1
      },
      externalAdReply: {
        title: video.title || botName,
        body: "Popkid-MD Video Downloader",
        mediaType: 1,
        renderLargerThumbnail: false, 
        thumbnailUrl: video.thumbnail,
        sourceUrl: video.url || "https://whatsapp.com/channel/0029VaeS6id0VycC9uY09s0F"
      }
    };

    // 3. Send Preview with small thumbnail styling
    await Popkid.sendMessage(from, {
      image: { url: video.thumbnail },
      renderSmallThumbnail: true, 
      caption: `*🎬 ${botName.toUpperCase()} VIDEO PLAYER*\n\n` +
               `╭───────────────◆\n` +
               `│ 📑 Title: ${video.title}\n` +
               `│ ⏳ Duration: ${video.timestamp || "N/A"}\n` +
               `╰────────────────◆\n\n` +
               `⏳ *Sending video...*`,
      contextInfo: contextInfo
    }, { quoted: mek });

    // 4. Send the Video File
    await Popkid.sendMessage(from, {
      video: { url: data.downloadLink },
      caption: `✅ *${video.title}* downloaded successfully!`,
      mimetype: "video/mp4",
      fileName: fileName,
      contextInfo: contextInfo
    }, { quoted: mek });

    // Success Reaction
    await react("✅");

  } catch (e) {
    console.error("[VIDEO ERROR]", e);
    reply("An error occurred while processing your video request.");
  }
});
