/**
 * NICK-XMD WhatsApp Bot (V1.0.0)
 * Creator: Popkid (Kenya)
 * Identity: Nick
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys')

const fs = require('fs')
const P = require('pino')
const path = require('path')
const zlib = require('zlib')
const { promisify } = require('util')
const { File } = require('megajs')
const express = require("express")
const qrcode = require('qrcode-terminal')

const config = require('./config')
const { sms, AntiDelete } = require('./lib')
const { getBuffer, runtime } = require('./lib/functions')
const { saveMessage } = require('./data')

const app = express()
const port = process.env.PORT || 9090
const sessionDir = path.join(__dirname, 'sessions')
const credsPath = path.join(sessionDir, 'creds.json')
const ownerNumber = ['254706360341'] 

let conn 

// ============ GLOBAL ANTI-CRASH ============
process.on("uncaughtException", (err) => console.error("❌ Exception:", err))
process.on("unhandledRejection", (err) => console.error("❌ Rejection:", err))

// ================= SESSION LOADER =================
async function loadSession() {
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    if (fs.existsSync(credsPath)) return true;
    if (!config.SESSION_ID) return false;

    if (config.SESSION_ID.startsWith("POPKID~")) {
        const sessionData = config.SESSION_ID.replace("POPKID~", "");
        
        // 1. Try Decompressing (Gzip Base64)
        try {
            const compressedBuffer = Buffer.from(sessionData, 'base64');
            if (compressedBuffer[0] === 0x1f && compressedBuffer[1] === 0x8b) {
                const gunzip = promisify(zlib.gunzip);
                const decompressedBuffer = await gunzip(compressedBuffer);
                fs.writeFileSync(credsPath, decompressedBuffer.toString('utf-8'));
                console.log("✅ Session Unzipped!");
                return true;
            }
        } catch (e) { /* Not a zip, continue to Mega */ }

        // 2. Try Mega.nz Download
        try {
            const filer = File.fromURL(`https://mega.nz/file/${sessionData}`);
            return new Promise((resolve) => {
                filer.download((err, data) => {
                    if(err) resolve(false);
                    else {
                        fs.writeFileSync(credsPath, data);
                        console.log("✅ Session Downloaded from Mega!");
                        resolve(true);
                    }
                });
            });
        } catch (error) { return false; }
    }
    return false;
}

// ================= TIME HELPER (EAT) =================
function getEATime() {
    const opts = { timeZone: 'Africa/Nairobi', hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' };
    const parts = new Intl.DateTimeFormat('en-KE', opts).formatToParts(new Date());
    let d = {}, t = {};
    parts.forEach(p => {
        if (['day', 'month', 'year'].includes(p.type)) d[p.type] = p.value;
        if (['hour', 'minute'].includes(p.type)) t[p.type] = p.value;
    });
    return { date: `${d.day}/${d.month}/${d.year}`, time: `${t.hour}:${t.minute}` };
}

// ================= CONNECTION LOGIC =================
async function connectToWA() {
    console.log("♻️ Connecting to WhatsApp...")
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
    const { version } = await fetchLatestBaileysVersion()

    conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        auth: state,
        version
    })

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) qrcode.generate(qr, { small: true })

        if (connection === 'close') {
            const restart = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (restart) setTimeout(() => connectToWA(), 5000)
        } else if (connection === 'open') {
            console.log('✅ NICK-XMD IS LIVE')

            // Load Plugins
            fs.readdirSync("./plugins/").forEach(file => {
                if (file.endsWith(".js")) require("./plugins/" + file)
            })

            let up = `╔══════════════════╗\n║ 🤖 𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗩𝟭 𝗢𝗡𝗟𝗜𝗡𝗘\n╠══════════════════╣\n║ 👤 OWNER : NICK\n║ 🔑 PREFIX : ${config.PREFIX}\n║ 🕒 UPTIME : ${runtime(process.uptime())}\n╚══════════════════╝`;
            await conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/j9ia5c.png` }, caption: up })
        }
    })

    conn.ev.on('creds.update', saveCreds)

    // Auto-Bio
    setInterval(async () => {
        if (config.AUTO_BIO === "true") {
            const { date, time } = getEATime();
            await conn.setStatus(`❤️ 𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 🤖 ɪs ʟɪᴠᴇ\n📅 ${date} | ⏰ ${time}`).catch(() => {});
        }
    }, 60000);

    // Messages Handler
    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0]
        if (!mek.message) return
        const from = mek.key.remoteJid
        const isStatus = from === 'status@broadcast'

        if (isStatus && config.AUTO_STATUS_SEEN === "true") await conn.readMessages([mek.key])
        
        const m = sms(conn, mek)
        const type = getContentType(mek.message)
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (mek.message[type]?.caption) || ''
        
        const isCmd = body.startsWith(config.PREFIX)
        const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const text = args.join(' ')
        const isOwner = ownerNumber.includes(mek.key.participant?.split('@')[0] || from.split('@')[0]) || mek.key.fromMe

        if (!isOwner && config.MODE === "private") return

        const events = require('./command')
        const cmd = events.commands.find(c => c.pattern === command || (c.alias && c.alias.includes(command)))

        if (cmd) {
            if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})
            try {
                await cmd.function(conn, mek, m, { from, body, isCmd, command, args, text, isOwner, reply: (t) => conn.sendMessage(from, { text: t }, { quoted: mek }) })
            } catch (e) { console.error(e) }
        }
    })
}

// ================= APP START =================
app.get("/", (req, res) => res.send("NICK-XMD STATUS: ACTIVE 🚀"))
app.listen(port)

async function main() {
    const loaded = await loadSession();
    if (loaded) connectToWA();
    else console.log("❌ Failed to load session. Check your config.js");
}

main();
