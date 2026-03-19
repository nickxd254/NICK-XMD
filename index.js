import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
    jidNormalizedUser,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './data/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import zlib from 'zlib';
import { promisify } from 'util';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';

const { emojis, doReact } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

let useQR = false;
let initialConnection = true;

// --- OPTIMIZED HELPERS ---
const isEnabled = (val) => {
    if (typeof val === 'boolean') return val;
    return String(val).toLowerCase() === "true";
};

const delay = ms => new Promise(res => setTimeout(res, ms));

// Better logging for debugging without cluttering the terminal
const logger = pino({ level: "silent" });

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

async function loadGiftedSession() {
    if (!config.SESSION_ID) return false;
    if (config.SESSION_ID.startsWith("POPKID~")) {
        const compressedBase64 = config.SESSION_ID.substring("POPKID~".length);
        try {
            const compressedBuffer = Buffer.from(compressedBase64, 'base64');
            const gunzip = promisify(zlib.gunzip);
            const decompressedBuffer = await gunzip(compressedBuffer);
            await fs.promises.writeFile(credsPath, decompressedBuffer.toString('utf-8'));
            return true;
        } catch (error) { return false; }
    }
    return false;
}

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version } = await fetchLatestBaileysVersion();
        
        const Matrix = makeWASocket({
            version,
            logger: logger,
            printQRInTerminal: useQR,
            browser: Browsers.macOS("Desktop"),
            // Advanced: Cache keys to make the bot respond faster and use less RAM
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            // Improved message retry logic
            generateHighQualityLinkPreview: true,
            syncFullHistory: false, 
            markOnlineOnConnect: true,
            getMessage: async (key) => { return { conversation: "POPKID-XD" }; }
        });

        // --- CONNECTION HANDLER ---
        Matrix.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) console.log(chalk.yellow("[QR] Scan the code above to connect POPKID-XD"));

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(chalk.red(`[SYSTEM] Connection lost. Reason: ${lastDisconnect.error?.message}. Reconnecting: ${shouldReconnect}`));
                if (shouldReconnect) start();
            } else if (connection === 'open') {
                if (initialConnection) {
                    console.log(chalk.green("✨ POPKID-XD Connected Successfully! ✨"));

                    // --- AUTO FOLLOW CHANNEL (Maintained) ---
                    const channelJid = "120363289379419860@newsletter";
                    try {
                        await Matrix.newsletterFollow(channelJid);
                        console.log(chalk.blue(`[AUTO-FOLLOW] Joined: ${channelJid}`));
                    } catch (error) {
                        console.log(chalk.gray(`[AUTO-FOLLOW] ${error.message}`));
                    }

                    // --- SUCCESS NOTIFICATION (Maintained) ---
                    const myId = jidNormalizedUser(Matrix.user.id);
                    await Matrix.sendMessage(myId, { 
                        image: { url: "https://files.catbox.moe/kiy0hl.jpg" }, 
                        caption: `\n\n*POPKID-XD ONLINE*\n\n╔════════════════╗\n║ 🤖 STATUS: ACTIVE\n╠════════════════╣\n║ 🔑 PREFIX : ${config.PREFIX}\n║ 👨‍💻 USER : ${Matrix.user.name || 'Developer'}\n╚════════════════╝`
                    });
                    initialConnection = false;
                }
            }
        });
        
        Matrix.ev.on('creds.update', saveCreds);

        // Core Event Handlers
        Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
        Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));

        Matrix.public = isEnabled(config.MODE === "public");

        // --- MAIN MESSAGE LISTENER ---
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek || !mek.message) return;
                
                // Advanced: Prevent the bot from processing its own commands in certain loops
                if (mek.key.fromMe && isEnabled(config.MODE !== "public")) return;

                // Run the main Command Handler
                await Handler(chatUpdate, Matrix, logger);

                const remoteJid = mek.key.remoteJid;
                const participant = mek.key.participant || remoteJid;
                const myId = jidNormalizedUser(Matrix.user.id);

                // --- STATUS (STORY) AUTOMATION (Maintained & Safe) ---
                if (remoteJid === 'status@broadcast') {
                    
                    // 1. Auto View Status
                    if (isEnabled(process.env.AUTO_READ_STATUS) || isEnabled(config.AUTO_STATUS_SEEN)) {
                        await Matrix.readMessages([mek.key]);
                        console.log(chalk.cyan(`[STATUS] Viewed story from: ${participant}`));
                    }

                    // 2. Auto Status Reaction
                    if (isEnabled(process.env.AUTO_STATUS_REACT) || isEnabled(config.AUTO_STATUS_REACT)) {
                        // Anti-ban delay: Wait 3-5 seconds before reacting
                        await delay(Math.floor(Math.random() * 2000) + 3000); 

                        const statusEmojis = ['❤️', '🔥', '💯', '🙌', '✨', '💎', '✅', '👑', '🥳'];
                        const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                        
                        try {
                            await Matrix.sendMessage(remoteJid, {
                                react: { text: randomEmoji, key: mek.key }
                            }, { 
                                statusJidList: [participant, myId] 
                            });
                        } catch (err) {
                            if (err.message.includes('rate-overlimit')) {
                                console.log(chalk.red(`[CRITICAL] Rate limit hit. Cooling down...`));
                                await delay(15000); 
                            }
                        }
                    }

                    // 3. Auto Status Reply
                    if (isEnabled(process.env.AUTO_STATUS_REPLY)) {
                        const replyMsg = process.env.STATUS_READ_MSG || config.STATUS_READ_MSG || "Nice Status! ✅";
                        await Matrix.sendMessage(participant, { text: replyMsg }, { quoted: mek });
                    }

                } else {
                    // REGULAR MESSAGE AUTO-REACT
                    if (isEnabled(config.AUTO_REACT) && !mek.key.fromMe) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                    }
                }

            } catch (err) {
                console.error(chalk.red('[ERROR]'), err.message);
            }
        });

    } catch (error) {
        console.error('Fatal Crash:', error);
        process.exit(1);
    }
}

async function init() {
    console.log(chalk.bold.green("Starting POPKID-XD System..."));
    if (fs.existsSync(credsPath)) {
        await start();
    } else {
        const loaded = await loadGiftedSession();
        if (loaded) {
            await start();
        } else {
            useQR = true;
            await start();
        }
    }
}

init();

// Web Server for Uptime
app.get('/', (req, res) => res.json({ status: "running", bot: "POPKID-XD" }));
app.listen(PORT, () => console.log(chalk.yellow(`[SERVER] Port: ${PORT}`)));
