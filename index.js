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

const { 
    Sticker, 
    createSticker, 
    StickerTypes 
} = require("wa-sticker-formatter");
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
                return { conversation: 'Error occurred' };
            },
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
            markOnlineOnConnect: true,
            syncFullHistory: false,
            generateHighQualityLinkPreview: false,
            patchMessageBeforeSending: (message) => {
                const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    };
                }
                return message;
            }
        };

        Popkid = popkidConnect(popkidSock);
        store.bind(Popkid.ev);

        Popkid.ev.process(async (events) => {
            if (events['creds.update']) await saveCreds();
        });

        // --- FIXED STATUS AUTO-HANDLER ---
        Popkid.ev.on('messages.upsert', async (mek) => {
            try {
                let msg = mek.messages[0];
                if (!msg || !msg.message) return;

                const isStatus = msg.key.remoteJid === "status@broadcast";
                if (!isStatus) return;

                const botJid = jidNormalizedUser(Popkid.user.id);
                // Standardize participant ID to handle all contacts (JID/LID)
                const participant = msg.key.participant || msg.key.remoteJid;

                msg.message = (getContentType(msg.message) === 'ephemeralMessage') 
                    ? msg.message.ephemeralMessage.message 
                    : msg.message;

                // 1. Auto Read Status
                if (autoReadStatus === "true") {
                    await Popkid.readMessages([msg.key, botJid]);
                }

                // 2. Auto Like Status (React)
                if (autoLikeStatus === "true" && msg.key.participant) {
                    const emoList = statusLikeEmojis?.split(',') || ["💛","❤️","💜","🤍","💙"]; 
                    const randomEmo = emoList[Math.floor(Math.random() * emoList.length)].trim(); 
                    await Popkid.sendMessage(
                        "status@broadcast",
                        { react: { key: msg.key, text: randomEmo } },
                        { statusJidList: [msg.key.participant, botJid] }
                    );
                }

                // 3. Auto Reply to Status
                if (autoReplyStatus === "true" && !msg.key.fromMe) {
                    const customMessage = statusReplyText || '✅ Status Viewed By popkid-Md';
                    await Popkid.sendMessage(participant, { text: customMessage }, { quoted: msg });
                }
            } catch (error) {
                console.error("Status Action Error:", error.message);
            }
        });

        // --- AUTO-REACT CHATS ---
        if (autoReact === "true") {
            Popkid.ev.on('messages.upsert', async (mek) => {
                const ms = mek.messages[0];
                if (!ms || ms.key.fromMe || ms.key.remoteJid === 'status@broadcast') return;
                try {
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await PopkidAutoReact(randomEmoji, ms, Popkid);
                } catch (err) { console.error('Auto reaction error:', err); }
            });
        }

        // --- ANTI-DELETE ---
        let giftech = { chats: {} };
        Popkid.ev.on("messages.upsert", async ({ messages }) => {
            try {
                const ms = messages[0];
                if (!ms?.message || ms.key.remoteJid === 'status@broadcast') return;
                const botUserJid = jidNormalizedUser(Popkid.user.id);
                const sender = ms.key.participant || ms.key.remoteJid;

                if (ms.key.fromMe) return;

                if (!giftech.chats[ms.key.remoteJid]) giftech.chats[ms.key.remoteJid] = [];
                giftech.chats[ms.key.remoteJid].push({
                    ...ms,
                    originalSender: sender, 
                    originalPushName: ms.pushName,
                    timestamp: Date.now()
                });

                if (giftech.chats[ms.key.remoteJid].length > 50) giftech.chats[ms.key.remoteJid].shift();

                if (ms.message?.protocolMessage?.type === 0) {
                    const deletedId = ms.message.protocolMessage.key.id;
                    const deletedMsg = giftech.chats[ms.key.remoteJid].find(m => m.key.id === deletedId);
                    if (!deletedMsg) return;
                    await PopkidAntiDelete(Popkid, deletedMsg, ms.key, sender, deletedMsg.originalSender, botUserJid, ms.pushName, deletedMsg.originalPushName);
                }
            } catch (error) { logger.error('Anti-delete error:', error); }
        });

        if (autoBio === 'true') {
            setInterval(() => PopkidAutoBio(Popkid), 60000);
        }

        Popkid.ev.on("call", async (json) => await PopkidAnticall(json, Popkid));

        // --- CONNECTION UPDATE ---
        Popkid.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
                console.log("✅ Connection Instance is Online");
                PopkidPresence(Popkid, "status@broadcast");
                
                setTimeout(async () => {
                    // Autofollow Newsletter
                    const channelJid = "120363423997837331@newsletter";
                    try { await Popkid.newsletterFollow(channelJid); } catch (e) {}

                    // Connected Box Message
                    if (startMess === 'true') {
                        const totalCommands = commands.filter(c => c.pattern).length;
                        const connectionMsg = `
*╭─❖  ${botName}  ❖─╮*
│
│  💠 *Status:* 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✅
│  ⚙️ *Prefix:* [ ${botPrefix} ]
│  📦 *Plugins:* ${totalCommands}
│  🔘 *Mode:* ${botMode}
│  👑 *Owner:* ${ownerNumber}
│  🎓 *Tutorials:* ${config.YT}
│  📰 *Updates:* ${newsletterUrl}
│
*╰───────────────❖╯*

> 💫 *${botCaption}*`;

                        await Popkid.sendMessage(Popkid.user.id, {
                            text: connectionMsg,
                            ...createContext(botName, { title: "BOT INTEGRATED", body: "Status: Ready for Use" })
                        }, { disappearingMessagesInChat: true, ephemeralExpiration: 300 });
                    }
                }, 5000);
            }

            if (connection === "close") {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                if (reason === DisconnectReason.loggedOut) {
                    await fs.remove(sessionDir);
                    process.exit(1);
                } else {
                    setTimeout(() => startPopkid(), RECONNECT_DELAY);
                }
            }
        });

        // Load Plugins
        const pluginsPath = path.join(__dirname, "popkid");
        if (fs.existsSync(pluginsPath)) {
            fs.readdirSync(pluginsPath).forEach((file) => {
                if (path.extname(file).toLowerCase() === ".js") require(path.join(pluginsPath, file));
            });
        }

        if (chatBot === 'true' || chatBot === 'audio') {
            PopkidChatBot(Popkid, chatBot, chatBotMode, createContext, createContext2, googleTTS);
        }

        // --- MESSAGE HANDLER ---
        Popkid.ev.on("messages.upsert", async ({ messages }) => {
            const ms = messages[0];
            if (!ms?.message || ms.key.remoteJid === 'status@broadcast') return;

            const from = ms.key.remoteJid;
            const type = getContentType(ms.message);
            const body = (type === 'conversation') ? ms.message.conversation : (type === 'extendedTextMessage') ? ms.message.extendedTextMessage.text : '';
            const isCmd = body.startsWith(botPrefix);
            const command = isCmd ? body.slice(botPrefix.length).trim().split(' ').shift().toLowerCase() : '';

            if (isCmd) {
                const cmd = commands.find(c => c.pattern === command || (c.aliases && c.aliases.includes(command)));
                if (cmd) {
                    if (botMode === "private" && !ms.key.fromMe) return;
                    // Logic for command execution here...
                }
            }
        });

    } catch (error) {
        console.error('Initialization error:', error);
        setTimeout(() => startPopkid(), RECONNECT_DELAY);
    }
}

startPopkid();
