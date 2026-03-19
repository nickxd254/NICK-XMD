import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
    jidNormalizedUser
} from '@whiskeysockets/baileys';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import zlib from 'zlib';
import { promisify } from 'util';
import config from './config.cjs';

const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino({ level: "silent" });

const __dirname = path.resolve();
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

// Ensure session folder exists
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// --- SESSION ID DECODER (Your exact logic) ---
async function loadNickSession() {
    if (!config.SESSION_ID) return false;
    
    // Check for the prefix (Adapting POPKID logic to our Nick MD)
    if (config.SESSION_ID.startsWith("POPKID~") || config.SESSION_ID.startsWith("NICK~")) {
        const compressedBase64 = config.SESSION_ID.includes('~') 
            ? config.SESSION_ID.split('~')[1] 
            : config.SESSION_ID;

        try {
            const compressedBuffer = Buffer.from(compressedBase64, 'base64');
            // Check GZIP headers
            if (compressedBuffer[0] === 0x1f && compressedBuffer[1] === 0x8b) {
                const gunzip = promisify(zlib.gunzip);
                const decompressedBuffer = await gunzip(compressedBuffer);
                await fs.promises.writeFile(credsPath, decompressedBuffer.toString('utf-8'));
                console.log(chalk.green("✅ Session Decoded Successfully!"));
                return true;
            }
        } catch (error) {
            console.log(chalk.red("❌ Error decoding Session ID:"), error.message);
            return false;
        }
    }
    return false;
}

async function start() {
    try {
        // Load session if creds don't exist
        if (!fs.existsSync(credsPath)) {
            await loadNickSession();
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version } = await fetchLatestBaileysVersion();
        
        const Matrix = makeWASocket({
            version,
            logger: logger,
            printQRInTerminal: true,
            browser: Browsers.macOS("Desktop"),
            auth: state,
            getMessage: async (key) => { return { conversation: "NICK-MD" }; }
        });

        // --- CONNECTION HANDLER ---
        Matrix.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(chalk.red(`Connection closed. Reconnecting: ${shouldReconnect}`));
                if (shouldReconnect) start();
            } else if (connection === 'open') {
                console.log(chalk.cyan("╔═════════════════════════════╗"));
                console.log(chalk.cyan("║    NICK MD CONNECTED ❤️     ║"));
                console.log(chalk.cyan("╚═════════════════════════════╝"));

                const myId = jidNormalizedUser(Matrix.user.id);
                await Matrix.sendMessage(myId, { 
                    text: `*NICK MD BOT IS ACTIVE*\n\n*Status:* Online\n*Prefix:* ${config.PREFIX}\n*Mode:* ${config.MODE}`
                });
            }
        });
        
        Matrix.ev.on('creds.update', saveCreds);

        // --- MESSAGE HANDLER ---
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;

            const from = mek.key.remoteJid;
            const body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
            const isCmd = body.startsWith(config.PREFIX);
            const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ')[0].toLowerCase() : null;

            // Auto Status Seen
            if (from === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
                await Matrix.readMessages([mek.key]);
            }

            if (isCmd) {
                if (command === 'ping') {
                    await Matrix.sendMessage(from, { text: 'NICK MD: Speed ⚡ 0.02ms' }, { quoted: mek });
                }
            }
        });

    } catch (error) {
        console.error('Critical Error:', error);
    }
}

start();

app.get('/', (req, res) => res.send('NICK-MD Web Server Active'));
app.listen(PORT, () => console.log(chalk.yellow(`Web Port: ${PORT}`)));
