const fs = require("fs");
require("dotenv").config();

/**
 * -----------------------------------------------------------------------
 * NICK-XMD CONFIGURATION 🚀
 * Developed for: Nick
 * Functionality: Stable & Optimized
 * -----------------------------------------------------------------------
 */

const config = {
  // ─── SESSION & SYSTEM ───────────────────────────────────────────────
  SESSION_ID: process.env.SESSION_ID || "",
  PREFIX: process.env.PREFIX || '.',
  MODE: process.env.MODE || "public", // 'public' or 'private'
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE === 'true',

  // ─── BRANDING & IDENTITY ──────────────────────────────────────────
  BOT_NAME: process.env.BOT_NAME || "NICK-XMD",
  OWNER_NAME: process.env.OWNER_NAME || "Nick",
  CAPTION: process.env.CAPTION || "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴɪᴄᴋ-xᴍᴅ",
  NEW_CMD: process.env.NEW_CMD || "ᴀᴅᴅᴠᴀʀ\n│ sᴜᴅᴏ\n| ɴɪᴄᴋ-xᴍᴅ",

  // ─── STATUS & STORY AUTOMATION ────────────────────────────────────
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN !== 'false', // Default: True
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT !== 'false', // Default: True
  AUTOLIKE_EMOJI: process.env.AUTOLIKE_EMOJI || '💙',
  AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS === 'true',
  STATUS_READ_MSG: process.env.STATUS_READ_MSG || 'Status Viewed by Nick-XMD ✅',

  // ─── SECURITY & PROTECTION ────────────────────────────────────────
  ANTILINK: process.env.ANTILINK === 'true',
  ANTI_DELETE: process.env.ANTI_DELETE === 'true',
  ANTI_LEFT: process.env.ANTI_LEFT !== 'false', // Default: True
  REJECT_CALL: process.env.REJECT_CALL === 'true',
  AUTO_BLOCK: process.env.AUTO_BLOCK === 'true',
  ANTIBOT: process.env.ANTIBOT === 'true',
  ANTIBOT_WARNINGS: parseInt(process.env.ANTIBOT_WARNINGS) || 3,

  // ─── CHAT & INTERACTION ───────────────────────────────────────────
  CHAT_BOT: process.env.CHAT_BOT === 'true',
  VOICE_CHAT_BOT: process.env.VOICE_CHAT_BOT === 'true',
  AUTO_REACT: process.env.AUTO_REACT === 'true',
  AUTO_STICKER: process.env.AUTO_STICKER === 'true',
  WELCOME: process.env.WELCOME === 'true',
  AUTO_TYPING: process.env.AUTO_TYPING === 'true',
  AUTO_RECORDING: process.env.AUTO_RECORDING === 'true',
  AUTO_READ: process.env.AUTO_READ === 'true',

  // ─── CONTACTS & KEYS ──────────────────────────────────────────────
  OWNER_NUMBER: process.env.OWNER_NUMBER || "254732297194",
  SUDO_NUMBER: process.env.SUDO_NUMBER || "254732297194",
  DELETED_MESSAGES_CHAT_ID: process.env.DELETED_MESSAGES_CHAT_ID || "254732297194@s.whatsapp.net",
  GEMINI_KEY: process.env.GEMINI_KEY || "AIzaSyCUPaxfIdZawsKZKqCqJcC-GWiQPCXKTDc",

  // ─── MISCELLANEOUS ───────────────────────────────────────────────
  BOT_MSG: process.env.BOT || "hello 👋",
  AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "hello",
  LYDEA: process.env.LYDEA === 'true',
  NOT_ALLOW: process.env.NOT_ALLOW !== 'false', // Default: True
};

module.exports = config;
