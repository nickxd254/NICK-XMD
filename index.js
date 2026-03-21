/**
 * NICK-XMD WhatsApp Bot (V1.0.0)
 * Creator: Popkid (Kenya)
 * Identity: Nick
 * Features: Auto-Reconnect, Anti-Crash, Auto-Status, Multi-Mode
 */

console.clear()
console.log("🌀 Starting NICK-XMD...")

// ============ GLOBAL ANTI-CRASH ============
process.on("uncaughtException", (err) => {
  console.error("❌ Critical Error:", err)
})
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise Rejected:", reason)
})

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  proto,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys')

const fs = require('fs')
const P = require('pino')
const path = require('path')
const axios = require('axios')
const os = require('os')
const util = require('util')
const { File } = require('megajs')
const FileType = require('file-type')
const express = require("express")

const config = require('./config')
const { sms, AntiDelete } = require('./lib')
const { getBuffer, getGroupAdmins, runtime } = require('./lib/functions')
const { saveMessage } = require('./data')

const app = express()
const port = process.env.PORT || 9090
const ownerNumber = ['254732297194'] // Your number

let conn 

//=================== CACHE CLEANER ============================
const tempDir = path.join(os.tmpdir(), 'nick-xmd-cache')
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)

setInterval(() => {
  fs.readdir(tempDir, (err, files) => {
    if (err) return
    files.forEach(file => fs.unlink(path.join(tempDir, file), () => {}))
  })
}, 5 * 60 * 1000)

//=================== SESSION HANDLER ============================
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
  if (!config.SESSION_ID) return console.log('❌ Error: SESSION_ID is missing in config!')
  const sessdata = config.SESSION_ID.replace("POPKID;;;", '') // Keeping your prefix compatibility
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
  filer.download((err, data) => {
    if (err) throw err
    fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
      console.log("📥 Session Downloaded Successfully!")
    })
  })
}

//=================== MAIN CONNECTION ============================
async function connectToWA() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/')
    const { version } = await fetchLatestBaileysVersion()

    conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Desktop"),
      auth: state,
      version
    })

    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
        if (shouldReconnect) {
          console.log('♻️ Connection lost. Reconnecting in 5s...')
          setTimeout(() => connectToWA(), 5000)
        }
      } else if (connection === 'open') {
        console.log('✅ NICK-XMD IS ONLINE')

        // Load Plugins
        const pluginDir = path.join(__dirname, 'plugins')
        fs.readdirSync(pluginDir).forEach((file) => {
          if (file.endsWith(".js")) require("./plugins/" + file)
        })

        let startupMsg = `╔══════════════════╗
║  🤖 𝗡𝗜𝗖𝗞-𝗫𝗠𝗗 𝗩𝟭 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗
╠══════════════════╣
║ 👤 OWNER  : NICK
║ 🔑 PREFIX : ${config.PREFIX}
║ ⚙️ MODE   : ${config.MODE}
║ 🕒 TIME   : ${new Date().toLocaleString()}
╚══════════════════╝`;
        
        await conn.sendMessage(conn.user.id, { 
          image: { url: `https://files.catbox.moe/j9ia5c.png` }, 
          caption: startupMsg 
        })
      }
    })

    conn.ev.on('creds.update', saveCreds)

    //=================== MESSAGE HANDLER ============================
    conn.ev.on('messages.upsert', async (mek) => {
      mek = mek.messages[0]
      if (!mek.message) return
      const from = mek.key.remoteJid
      const isStatus = from === 'status@broadcast'
      
      // Auto Read Status
      if (isStatus && config.AUTO_STATUS_SEEN === "true") {
        await conn.readMessages([mek.key])
      }

      const m = sms(conn, mek)
      const type = getContentType(mek.message)
      const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
      
      const isCmd = body.startsWith(config.PREFIX)
      const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase() : ''
      const args = body.trim().split(/ +/).slice(1)
      const text = args.join(' ')
      
      const isGroup = from.endsWith('@g.us')
      const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net') : (mek.key.participant || mek.key.remoteJid)
      const senderNumber = sender.split('@')[0]
      const isOwner = ownerNumber.includes(senderNumber) || mek.key.fromMe

      // Mode Filter
      if (!isOwner && config.MODE === "private") return

      // Execute Commands
      const events = require('./command')
      const cmd = events.commands.find((c) => c.pattern === command || (c.alias && c.alias.includes(command)))
      
      if (cmd) {
        if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})
        try {
          await cmd.function(conn, mek, m, { from, body, isCmd, command, args, text, isGroup, sender, isOwner, reply: (t) => conn.sendMessage(from, { text: t }, { quoted: mek }) })
        } catch (e) {
          console.error("Plugin Error:", e)
        }
      }
    })

  } catch (err) {
    console.error("Connection Error:", err)
  }
}

//=================== SERVER START ============================
app.get("/", (req, res) => res.send("NICK-XMD IS RUNNING 🚀"))
app.listen(port, () => console.log(`Server on port ${port}`))

setTimeout(connectToWA, 3000)
