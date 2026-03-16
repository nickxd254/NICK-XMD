const { 
    default: popkidConnect, 
    isJidGroup, 
    jidNormalizedUser,
    isJidBroadcast,
    downloadMediaMessage, 
    downloadContentFromMessage,
    downloadAndSaveMediaMessage, 
    DisconnectReason, 
    getContentType,
    fetchLatestBaileysVersion, 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore,
    jidDecode 
} = require("gifted-baileys");

const { 
    evt, 
    logger,
    emojis,
    pmdStore,
    commands,
    setSudo,
    delSudo,
    PopkidTechApi,
    PopkidApiKey,
    PopkidAutoReact,
    PopkidAntiLink,
    PopkidAutoBio,
    PopkidChatBot,
    loadSession,
    getMediaBuffer,
    getSudoNumbers,
    getFileContentType,
    bufferToStream,
    uploadToPixhost,
    uploadToImgBB,
    setCommitHash, 
    getCommitHash,
    pmdBuffer, pmdJson, 
    formatAudio, formatVideo,
    uploadToGithubCdn,
    uploadToPopkidCdn,
    uploadToPasteboard,
    uploadToCatbox,
    PopkidAnticall,
    createContext, 
    createContext2,
    verifyJidState,
    PopkidPresence,
    PopkidAntiDelete
} = require("./pop");

const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const pino = require("pino");
const config = require("./config");
const axios = require("axios");
const googleTTS = require("google-tts-api");
const fs = require("fs-extra");
const path = require("path");
const { Boom } = require("@hapi/boom");
const express = require("express");
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

const {
    MODE: botMode, 
    BOT_PIC: botPic, 
    FOOTER: botFooter, 
    CAPTION: botCaption, 
    VERSION: botVersion, 
    OWNER_NUMBER: ownerNumber, 
    OWNER_NAME: ownerName,  
    BOT_NAME: botName, 
    PREFIX: botPrefix,
    PRESENCE: botPresence,
    CHATBOT: chatBot,
    CHATBOT_MODE: chatBotMode,
    STARTING_MESSAGE: startMess,
    ANTIDELETE: antiDelete,
    ANTILINK: antiLink,
    ANTICALL: antiCall,
    TIME_ZONE: timeZone,
    BOT_REPO: popkidRepo,
    NEWSLETTER_JID: newsletterJid,
    NEWSLETTER_URL: newsletterUrl,
    AUTO_REACT: autoReact,
    AUTO_READ_STATUS: autoReadStatus,
    AUTO_LIKE_STATUS: autoLikeStatus,
    STATUS_LIKE_EMOJIS: statusLikeEmojis,
    AUTO_REPLY_STATUS: autoReplyStatus,
    STATUS_REPLY_TEXT: statusReplyText,
    AUTO_READ_MESSAGES: autoRead,
    AUTO_BLOCK: autoBlock,
    AUTO_BIO: autoBio } = config;

const PORT = process.env.PORT || 4420;
const app = express();
let Popkid;

logger.level = "silent";

app.use(express.static("pop"));
app.get("/", (req, res) => res.sendFile(__dirname + "/pop/popkid.html"));
app.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`));

const sessionDir = path.join(__dirname, "pop", "session");
loadSession();

let store; 
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 50;
const RECONNECT_DELAY = 5000;

async function startPopkid() {
    try {
        const { version, isLatest } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        
        if (store) store.destroy();
        store = new pmdStore();
        
        const popkidSock = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Popkid-MD', "Safari", "1.0.0"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            getMessage: async (key) => {
                if (store) {
                    const msg = store.loadMessage(key.remoteJid, key.id);
                    return msg?.message || undefined;
                }
                return { conversation: 'Message not found in store' };
            },
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true
        };

        Popkid = popkidConnect(popkidSock);
        store.bind(Popkid.ev);

        Popkid.ev.on('creds.update', saveCreds);

        // --- CONNECTION UPDATE HANDLER ---
        Popkid.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === "connecting") console.log("🕗 Connecting to WhatsApp...");

            if (connection === "open") {
                console.log("✅ Popkid-MD Connection Online");
                
                // 1. Auto-follow Newsletter
                const targetChannel = "120363423997837331@newsletter";
                await Popkid.newsletterFollow(targetChannel).catch(() => {});

                // 2. Send Connection Box Message
                if (startMess === 'true') {
                    const totalCommands = commands.length;
                    const modeDisplay = botMode === 'public' ? "Public" : "Private";
                    const connectionMsg = `
*╭─❖  ${botName}  ❖─╮*
│
│  💠 *Status:* 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✅
│  ⚙️ *Prefix:* [ ${botPrefix} ]
│  📦 *Plugins:* ${totalCommands} Loaded
│  🔘 *Mode:* ${modeDisplay}
│  👑 *Owner:* ${ownerNumber}
│  📰 *Updates:* ${newsletterUrl}
│
*╰───────────────❖╯*

> 💫 *${botCaption}*`;

                    await Popkid.sendMessage(Popkid.user.id, {
                        text: connectionMsg,
                        contextInfo: {
                            externalAdReply: {
                                title: "BOT INTEGRATED",
                                body: "Popkid-MD is now active",
                                thumbnail: await getMediaBuffer(botPic),
                                sourceUrl: newsletterUrl,
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    });
                }
            }

            if (connection === "close") {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                if (reason === DisconnectReason.loggedOut) {
                    console.log("Device Logged Out. Delete session and scan again.");
                    process.exit(1);
                } else {
                    setTimeout(() => startPopkid(), RECONNECT_DELAY);
                }
            }
        });

        // --- STATUS AUTO-HANDLER (FIXED FOR ALL CONTACTS) ---
        Popkid.ev.on('messages.upsert', async (mek) => {
            try {
                const msg = mek.messages[0];
                if (!msg || !msg.message) return;

                if (msg.key.remoteJid === "status@broadcast") {
                    const botJid = jidNormalizedUser(Popkid.user.id);
                    const participant = msg.key.participant || msg.key.remoteJid;

                    // Read Status
                    if (autoReadStatus === "true") {
                        await Popkid.readMessages([msg.key]);
                    }

                    // Like/React to Status
                    if (autoLikeStatus === "true" && msg.key.participant) {
                        const emoList = statusLikeEmojis?.split(',') || ["💛","❤️","💜","🤍","💙"]; 
                        const randomEmo = emoList[Math.floor(Math.random() * emoList.length)].trim(); 
                        await Popkid.sendMessage(
                            "status@broadcast",
                            { react: { key: msg.key, text: randomEmo } },
                            { statusJidList: [msg.key.participant, botJid] }
                        );
                    }

                    // Reply to Status
                    if (autoReplyStatus === "true" && !msg.key.fromMe) {
                        const replyMsg = statusReplyText || '✅ Status Viewed By Popkid-MD';
                        await Popkid.sendMessage(participant, { text: replyMsg }, { quoted: msg });
                    }
                }
            } catch (err) { console.error("Status error:", err.message); }
        });

        // --- CHAT MESSAGES HANDLER ---
        Popkid.ev.on("messages.upsert", async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.message || mek.key.remoteJid === 'status@broadcast') return;

                const from = mek.key.remoteJid;
                const botId = jidNormalizedUser(Popkid.user.id);
                const sender = mek.key.participant || mek.key.remoteJid;
                const type = getContentType(mek.message);
                const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type === 'imageMessage') ? mek.message.imageMessage.caption : (type === 'videoMessage') ? mek.message.videoMessage.caption : '';

                // Auto React to normal chats
                if (autoReact === "true" && !mek.key.fromMe) {
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await PopkidAutoReact(randomEmoji, mek, Popkid);
                }

                // Command Handler
                const isCmd = body.startsWith(botPrefix);
                const command = isCmd ? body.slice(botPrefix.length).trim().split(' ').shift().toLowerCase() : '';
                const args = body.trim().split(/\s+/).slice(1);

                if (isCmd) {
                    const cmd = commands.find(c => c.pattern === command || (c.aliases && c.aliases.includes(command)));
                    if (cmd) {
                        if (botMode === "private" && !mek.key.fromMe) return;
                        
                        await cmd.function(from, Popkid, {
                            m: mek,
                            args,
                            text: args.join(" "),
                            reply: (t) => Popkid.sendMessage(from, { text: t }, { quoted: mek }),
                            botName,
                            sender,
                            isGroup: isJidGroup(from),
                            // Extra context can be added here
                        });
                    }
                }
            } catch (e) { console.error(e); }
        });

        // Call & Bio Handlers
        Popkid.ev.on("call", async (json) => await PopkidAnticall(json, Popkid));
        if (autoBio === 'true') setInterval(() => PopkidAutoBio(Popkid), 60000);

        // Load Plugin Files
        const pluginsPath = path.join(__dirname, "popkid");
        if (fs.existsSync(pluginsPath)) {
            fs.readdirSync(pluginsPath).forEach((file) => {
                if (file.endsWith(".js")) require(path.join(pluginsPath, file));
            });
            console.log("✅ All Plugins Loaded Successfully");
        }

    } catch (error) {
        console.error('Socket error:', error);
        setTimeout(() => startPopkid(), RECONNECT_DELAY);
    }
}

// Global Cleanup
process.on('SIGINT', () => { if (store) store.destroy(); process.exit(0); });

// Start Bot
startPopkid();
