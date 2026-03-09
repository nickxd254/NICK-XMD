const { pmd } = require("../pop");
const { downloadContentFromMessage, generateWAMessageFromContent, normalizeMessageContent } = require('gifted-baileys');
const { sendButtons } = require('gifted-btns');

pmd({
    pattern: "sendimage",
    aliases: ["sendimg", "dlimg", "dlimage"],
    category: "downloader",
    react: "📷",
    description: "Download Audio from url"
  },
  async (from, Popkid, conText) => {
    const { q, mek, reply, react, sender, botFooter, pmdBuffer } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide image url");
    }

    try {
      const buffer = await pmdBuffer(q);
      if (buffer instanceof Error) {
        await react("❌");
        return reply("Failed to download the image file.");
      }
      await Popkid.sendMessage(from, {
        image: imageBuffer,
        mimetype: "image/jpg",
        caption: `> *${botFooter}*`,
      }, { quoted: mek });
      await react("✅");
    } catch (error) {
      console.error("Error during download process:", error);
      await react("❌");
      return reply("Oops! Something went wrong. Please try again.");
    }
  }
);


pmd({
    pattern: "sendaudio",
    aliases: ["sendmp3", "dlmp3", "dlaudio"],
    category: "downloader",
    react: "🎶",
    description: "Download Audio from url"
  },
  async (from, Popkid, conText) => {
    const { q, mek, reply, react, sender, botFooter, pmdBuffer, formatAudio } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide audio url");
    }

    try {
      const buffer = await pmdBuffer(q);
      const convertedBuffer = await formatAudio(buffer);
      if (buffer instanceof Error) {
        await react("❌");
        return reply("Failed to download the audio file.");
      }
      await Popkid.sendMessage(from, {
        audio: convertedBuffer,
        mimetype: "audio/mpeg",
        caption: `> *${botFooter}*`,
      }, { quoted: mek });
      await react("✅");
    } catch (error) {
      console.error("Error during download process:", error);
      await react("❌");
      return reply("Oops! Something went wrong. Please try again.");
    }
  }
);


pmd({
    pattern: "sendvideo",
    aliases: ["sendmp4", "dlmp4", "dvideo"],
    category: "downloader",
    react: "🎥",
    description: "Download Video from url"
  },
  async (from, Popkid, conText) => {
    const { q, mek, reply, react, sender, botFooter, pmdBuffer, formatVideo } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide video url");
    }

    try {
      const buffer = await pmdBuffer(q);
      const convertedBuffer = await formatVideo(buffer);
      if (buffer instanceof Error) {
        await react("❌");
        return reply("Failed to download the video file.");
      }
      await Popkid.sendMessage(from, {
        document: convertedBuffer,
        fileName: "Video.mp4",
        mimetype: "video/mp4",
        caption: `> *${botFooter}*`,
      }, { quoted: mek });
      await react("✅");
    } catch (error) {
      console.error("Error during download process:", error);
      await react("❌");
      return reply("Oops! Something went wrong. Please try again.");
    }
  }
);


pmd({
    pattern: "play",
    aliases: ["ytmp3", "ytmp3doc", "audiodoc", "yta"],
    category: "downloader",
    react: "🎶",
    description: "Download Video from Youtube"
  },
  async (from, Popkid, conText) => {
    const { q, mek, reply, react, sender, botPic, botName, botFooter, newsletterUrl, newsletterJid, pmdJson, pmdBuffer, formatAudio, PopkidTechApi, PopkidApiKey } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a song name or youtube url");
    }

    try {
      const searchResponse = await pmdJson(`https://yts.giftedtech.co.ke/?q=${encodeURIComponent(q)}`);

      if (!searchResponse || !Array.isArray(searchResponse.videos)) {
        await react("❌");
        return reply("Invalid response from search API. Please try again.");
      }

      if (searchResponse.videos.length === 0) {
        await react("❌");
        return reply("No results found for your search.");
      }

      const firstVideo = searchResponse.videos[0];
      const videoUrl = firstVideo.url;

      const audioApi = `${PopkidTechApi}/api/download/ytmp3?stream=true&apikey=${PopkidApiKey}&url=${encodeURIComponent(videoUrl)}`;

      const response = await pmdBuffer(audioApi);
      
      const sizeMB = response.length / (1024 * 1024);
      if (sizeMB > 16) {
        await reply("File is large, processing might take a while...");
      }

      const convertedBuffer = await formatAudio(response);

      const dateNow = Date.now();
      
      // Send buttons 
      await sendButtons(Popkid, from, {
        title: `${botName} 𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑`,
        text: `⿻ *Title:* ${firstVideo.name}\n⿻ *Duration:* ${firstVideo.duration}\n\n*Select download format:*`,
        footer: botFooter,
        image: firstVideo.thumbnail || botPic,
        buttons: [
          { id: `id1_${firstVideo.id}_${dateNow}`, text: 'Audio 🎶' },
          { id: `id2_${firstVideo.id}_${dateNow}`, text: 'Audio Document 📄' },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'Watch on Youtube',
              url: firstVideo.url
            })
          }
        ]
      });

      const handleResponse = async (event) => {
        const messageData = event.messages[0];
        if (!messageData.message) return;
        
        // Check if it's a template button reply
        const templateButtonReply = messageData.message?.templateButtonReplyMessage;
        if (!templateButtonReply) return;
        
        const selectedButtonId = templateButtonReply.selectedId;
        const selectedDisplayText = templateButtonReply.selectedDisplayText;
        
        const isFromSameChat = messageData.key?.remoteJid === from;
        if (!isFromSameChat) return;

        await react("⬇️");

        try {
          if (!selectedButtonId.includes(`_${dateNow}`)) {
            return;
          }
          
          switch (selectedButtonId) {
            case `id1_${firstVideo.id}_${dateNow}`:
              await Popkid.sendMessage(from, {
                audio: convertedBuffer,
                mimetype: "audio/mpeg",
              }, { quoted: messageData });
              break;

            case `id2_${firstVideo.id}_${dateNow}`:
              await Popkid.sendMessage(from, {
                document: convertedBuffer,
                mimetype: "audio/mpeg",
                fileName: `${firstVideo.name}.mp3`.replace(/[^\w\s.-]/gi, ''),
                caption: `${firstVideo.name}`,
              }, { quoted: messageData });
              break;

            default:
              await reply("Invalid option selected. Please use the buttons provided.", messageData);
              return;
          }
          
          await react("✅");
        } catch (error) {
          console.error("Error sending media:", error);
          await react("❌");
          await reply("Failed to send media. Please try again.", messageData);
        }
      };

      Popkid.ev.on("messages.upsert", handleResponse);

    } catch (error) {
      console.error("Error during download process:", error);
      await react("❌");
      return reply("Oops! Something went wrong. Please try again.");
    }
  }
);


/* pmd({
    pattern: "play",
    aliases: ["ytmp3", "ytmp3doc", "audiodoc", "yta"],
    category: "downloader",
    react: "🎶",
    description: "Download Video from Youtube"
  },
  async (from, Popkid, conText) => {
    const { q, mek, reply, react, sender, botPic, botName, botFooter, newsletterUrl, newsletterJid, pmdJson, pmdBuffer, formatAudio, PopkidTechApi, PopkidApiKey } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a song name or youtube url");
    }

    try {
      const searchResponse = await pmdJson(`https://yts.Popkidtech.co.ke/?q=${encodeURIComponent(q)}`);

      if (!searchResponse || !Array.isArray(searchResponse.videos)) {
        await react("❌");
        return reply("Invalid response from search API. Please try again.");
      }

      if (searchResponse.videos.length === 0) {
        await react("❌");
        return reply("No results found for your search.");
      }

      const firstVideo = searchResponse.videos[0];
      const videoUrl = firstVideo.url;

      const audioApi = `${PopkidTechApi}/api/download/ytmp3?stream=true&apikey=${PopkidApiKey}&url=${encodeURIComponent(videoUrl)}`;

      const response = await pmdBuffer(audioApi);
      
     const sizeMB = response.length / (1024 * 1024);
      if (sizeMB > 16) {
        await reply("File is large, processing might take a while...");
      }

      const convertedBuffer = await formatAudio(response);
            const infoMess = {
        image: { url: firstVideo.thumbnail || botPic },
        caption: `> *${botName} 𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*
╭───────────────◆
│⿻ *Title:* ${firstVideo.name}
│⿻ *Duration:* ${firstVideo.duration}
╰────────────────◆
⏱ *Session expires in 3 minutes*
╭───────────────◆
│Reply With:
│1️⃣ To Download Audio 🎶
│2️⃣ To Download as Document 📄
╰────────────────◆`,
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

      const messageSent = await Popkid.sendMessage(from, infoMess, { quoted: mek });
      const messageId = messageSent.key.id;

      const handleResponse = async (event) => {
        const messageData = event.messages[0];
        if (!messageData.message) return;
        const isReplyToDownloadPrompt = messageData.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReplyToDownloadPrompt) return;
        const messageContent = messageData.message.conversation || messageData.message.extendedTextMessage?.text;
        await react("⬇️");

        try {
          switch (messageContent.trim()) {
            case "1":
              await Popkid.sendMessage(from, {
                audio: convertedBuffer,
                mimetype: "audio/mpeg",
                fileName: `${firstVideo.name}.mp3`.replace(/[^\w\s.-]/gi, ''),
                caption: `${firstVideo.name}`,
                externalAdReply: {
                  title: `${firstVideo.name}.mp3`,
                  body: 'Youtube Downloader',
                  mediaType: 1,
                  thumbnailUrl: firstVideo.thumbnail || botPic,
                  sourceUrl: newsletterUrl,
                  renderLargerThumbnail: false,
                  showAdAttribution: true,
                },
              }, { quoted: messageData });
              break;

            case "2":
              await Popkid.sendMessage(from, {
                document: convertedBuffer,
                mimetype: "audio/mpeg",
                fileName: `${firstVideo.name}.mp3`.replace(/[^\w\s.-]/gi, ''),
                caption: `${firstVideo.name}`,
              }, { quoted: messageData });
              break;

            default:
              await reply("Invalid option selected. Please reply with:\n1️⃣ For Audio\n2️⃣ For Document", messageData);
              return;
          }
          await react("✅");
        } catch (error) {
          console.error("Error sending media:", error);
          await react("❌");
          await reply("Failed to send media. Please try again.", messageData);
        }
      };

      let sessionExpired = false;

      const timeoutHandler = () => {
        sessionExpired = true;
        Popkid.ev.off("messages.upsert", handleResponse);
      };

      setTimeout(timeoutHandler, 180000);

      Popkid.ev.on("messages.upsert", handleResponse);

    } catch (error) {
      console.error("Error during download process:", error);
      await react("❌");
      return reply("Oops! Something went wrong. Please try again.");
    }
  }
);
*/

pmd({
    pattern: "video",
    aliases: ["ytmp4doc", "mp4", "ytmp4", "dlmp4"],
    category: "downloader",
    react: "🎥",
    description: "Download Video from Youtube"
  },
  async (from, Popkid, conText) => {
    const { q, mek, reply, react, sender, botPic, botName, botFooter, newsletterUrl, newsletterJid, pmdJson, pmdBuffer, formatVideo, PopkidTechApi, PopkidApiKey } = conText;

    if (!q) {
      await react("❌");
      return reply("Please provide a video name or youtube url");
    }

    try {
      const searchResponse = await pmdJson(`https://yts.giftedtech.co.ke/?q=${encodeURIComponent(q)}`);

      if (!searchResponse || !Array.isArray(searchResponse.videos)) {
        await react("❌");
        return reply("Invalid response from search API. Please try again.");
      }

      if (searchResponse.videos.length === 0) {
        await react("❌");
        return reply("No results found for your search.");
      }

      const firstVideo = searchResponse.videos[0];
      const videoUrl = firstVideo.url;

        const audioApi = `${PopkidTechApi}/api/download/ytmp4?stream=true&apikey=${PopkidApiKey}&url=${encodeURIComponent(videoUrl)}`;

      const response = await pmdBuffer(videoApi);

      const sizeMB = response.length / (1024 * 1024);
      if (sizeMB > 16) {
        await reply("File is large, processing might take a while...");
      }

      const convertedBuffer = await formatVideo(response);

      const infoMess = {
        image: { url: firstVideo.thumbnail || botPic },
        caption: `> *${botName} 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*
╭───────────────◆
│⿻ *Title:* ${firstVideo.name}
│⿻ *Duration:* ${firstVideo.duration}
╰────────────────◆
⏱ *Session expires in 3 minutes*
╭───────────────◆
│Reply With:
│1️⃣ To Download Video 🎥
│2️⃣ To Download as Document 📄
╰────────────────◆`,
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

      const messageSent = await Popkid.sendMessage(from, infoMess, { quoted: mek });
      const messageId = messageSent.key.id;

      const handleResponse = async (event) => {
        const messageData = event.messages[0];
        if (!messageData.message) return;
        const isReplyToDownloadPrompt = messageData.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReplyToDownloadPrompt) return;
        const messageContent = messageData.message.conversation || messageData.message.extendedTextMessage?.text;
        await react("⬇️");

        try {
          switch (messageContent.trim()) {
            case "1":
              await Popkid.sendMessage(from, {
                video: convertedBuffer,
                mimetype: "video/mp4",
                pvt: true,
                fileName: `${firstVideo.name}.mp4`.replace(/[^\w\s.-]/gi, ''),
                caption: `🎥 ${firstVideo.name}`,
              }, { quoted: messageData });
              break;

            case "2":
              await Popkid.sendMessage(from, {
                document: convertedBuffer,
                mimetype: "video/mp4",
                fileName: `${firstVideo.name}.mp4`.replace(/[^\w\s.-]/gi, ''),
                caption: `📄 ${firstVideo.name}`,
              }, { quoted: messageData });
              break;

            default:
              await reply("Invalid option selected. Please reply with:\n1️⃣ For Video\n2️⃣ For Document", messageData);
              return;
          }
          await react("✅");
        } catch (error) {
          console.error("Error sending media:", error);
          await react("❌");
          await reply("Failed to send media. Please try again.", messageData);
        }
      };

      let sessionExpired = false;

      const timeoutHandler = () => {
        sessionExpired = true;
        Popkid.ev.off("messages.upsert", handleResponse);
      };

      setTimeout(timeoutHandler, 180000);

      Popkid.ev.on("messages.upsert", handleResponse);

    } catch (error) {
      console.error("Error during download process:", error);
      await react("❌");
      return reply("Oops! Something went wrong. Please try again.");
    }
  }
);
