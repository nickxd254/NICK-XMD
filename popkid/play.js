/**
 * yt-play.js
 * Exact styling for Popkid-MD
 * Converted to work accurately in your base
 */

const { pmd } = require("../pop");
const axios = require("axios");
const yts = require("yt-search");

const BASE_URL = "https://noobs-api.top";

pmd({
  pattern: "play",
  aliases: ["p"],
  react: "🎵",
  category: "download",
  description: "Play audio (stream) from YouTube",
}, async (from, Popkid, conText) => {
  const { mek, q, args, reply, react, botName, newsletterJid, newsletterUrl } = conText;

  const query = q || args.join(" ");
  if (!query) return reply("Please provide a song name.");

  try {
    // 1. YouTube Search
    const search = await yts(query);
    const video = (search && (search.videos && search.videos[0])) || (search.all && search.all[0]);
    if (!video) return reply("No results found.");

    const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, "");
    const fileName = `${safeTitle}.mp3`;
    
    // 2. Fetch using API
    const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId || video.url)}&format=mp3`;
    const { data } = await axios.get(apiURL);
    
    if (!data || !data.downloadLink) return reply("Failed to get download link.");

    // 3. Send exact Image Preview with "View Channel" link
    await Popkid.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: `*🎶 ${botName.toUpperCase()} PLAYER*\n\n` +
               `╭───────────────◆\n` +
               `│ 📑 Title: ${video.title}\n` +
               `│ ⏳ Duration: ${video.timestamp || "N/A"}\n` +
               `╰────────────────◆\n\n` +
               `⏳ *Sending audio...*`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: newsletterJid,
          newsletterName: botName,
          serverMessageId: -1
        },
        externalAdReply: {
            title: botName,
            body: "Get more info about this message.",
            mediaType: 1,
            sourceUrl: "https://whatsapp.com/channel/0029VaeS6id0VycC9uY09s0F",
            renderLargerThumbnail: false
        }
      }
    }, { quoted: mek });

    // 4. Send Playable Audio
    await Popkid.sendMessage(from, {
      audio: { url: data.downloadLink },
      mimetype: "audio/mpeg",
      fileName: fileName,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: `${botName} Music`,
          mediaType: 1,
          thumbnailUrl: video.thumbnail,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: mek });

    await react("✅");

  } catch (e) {
    console.error("[PLAY ERROR]", e);
    reply("An error occurred while processing your request.");
  }
});
