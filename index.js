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
const __dirname = path.resolve();
const sessionDir = path.join(__dirname, 'session');
const pluginsDir = path.join(__dirname, 'plugins');
const credsPath = path.join(sessionDir, 'creds.json');

// Ensure folders exist
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });

// --- EXACT SESSION DECODER FROM YOUR SAMPLE ---
async function loadGiftedSession() {
    if (!config.SESSION_ID) return false;
    if (config.SESSION_ID.startsWith("POPKID~")) {
        const compressedBase64 = config.SESSION_ID.substring("POPKID~".length);
        try {
            const compressedBuffer = Buffer.from(compressedBase64, 'base64');
            if (compressedBuffer[0] === 0x1f && compressedBuffer[1] === 0x8b) {
                const gunzip = promisify(zlib.gunzip);
                const decompressedBuffer = await gunzip(compressedBuffer);
                await fs.promises.writeFile(credsPath, decompressedBuffer.toString('utf-8'));
                console.log(chalk.green("✅ Nick MD: Session Authenticated Successfully"));
                return true;
            }
        } catch (error) { 
            console.log(chalk.red("❌ Session Error:"), error.message);
            return false; 
        }
    }
    return false;
}

async function start() {
    try {
        // Load session if creds don't exist yet
        if (!fs.existsSync(credsPath)) {
            await loadGiftedSession();
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version } = await fetchLatestBaileysVersion();
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true,
            browser: Browsers.macOS("Desktop"),
            auth: state,
            getMessage: async (key) => { return { conversation: "NICK-XMD" }; }
        });

        // --- PLUGIN LOADER ENGINE ---
        const plugins = {};
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        for (const file of pluginFiles) {
            try {
                const plugin = await import(`./plugins/${file}?t=${Date.now()}`);
                plugins[file] = plugin.default;
            } catch (e) { console.log(chalk.red(`Error loading plugin ${file}:`), e.message); }
        }

        Matrix.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) start();
            } else if (connection === 'open') {
                console.log(chalk.cyan("🚀 NICK-XMD IS ONLINE"));
                const myId = jidNormalizedUser(Matrix.user.id);
                await Matrix.sendMessage(myId, { text: `*NICK-XMD READY*\n\nPlugins Loaded: ${Object.keys(plugins).length}\nPrefix: ${config.PREFIX}` });
            }
        });
        
        Matrix.ev.on('creds.update', saveCreds);

        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;

            const from = m.key.remoteJid;
            const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
            const isCmd = body.startsWith(config.PREFIX);
            const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ')[0].toLowerCase() : null;
            const args = body.trim().split(/ +/).slice(1);

            // Auto Status View (Your sample logic)
            if (from === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
                await Matrix.readMessages([m.key]);
            }

            // --- EXECUTE EXTERNAL PLUGINS ---
            for (const name in plugins) {
                try {
                    await plugins[name](Matrix, m, { command, args, isCmd, from, body });
                } catch (err) { console.error(err); }
            }
        });

    } catch (error) {
        console.error('Critical Error:', error);
    }
}

start();
app.get('/', (req, res) => res.send('NICK-XMD Active'));
app.listen(PORT);
