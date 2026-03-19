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
  SESSION_ID: process.env.SESSION_ID || "POPKID~;;;H4sIAAAAAAAAA5VUXZOqOBD9L3nVuoIgoFVTtYIo+Imig7p1HyIEjHwnAYRb/vctnJk787B7a/YtNJ0+p0+fzi+QpJiiBarB6BfICC4hQ+2R1RkCI6AWvo8I6AIPMghGwFz2lfLSm7qdOsnlYG4dE1Fnau6gcyQb0JQ2+QRLro5m4gt4dEFWXCLs/qGgFNiBcHjl58p6o1iVI3XmPd+iQ12hNdpNokIP1U26kug+fQGPtiLEBCeBnl1RjAiMFqi2ICbfo69vMHTDPTHuC1lP5qbrolmuM+2WWr3K55fOvr9UFpdFHgffo7/0UKKSRltND2JD6HZ4f7VVrEKm2EiU7oVuRLNsMKTnW/BGn+IgQZ7poYRhVn9b98IYQLo71uPlkg/PTaMVx0PRCVY92YPVZn3sdV7DMxnmxZT7HvEKeeNsSMr7gdvIHTkVY6xJSXbkq3RTHIvw1Tqt0ldlAm+nr8Qt8uGV8P/ozq1UMrulSkANPpPnknC5S+ksksji4PSGt20uCbI83Bl+bH7TNvHshpfaci2uxvuYLtcTOi29YaWxSj9zZd8oTp5z2B7DO/2kD1lB/sRyZ6iXbD4vsXx2ZD0yVZ2GTY+ox+minNLzzJgcDL5Bk8OiaPR0LK5v3MzAjhweB0GVn7YqLbSVpAt9qa6MvpD75XqAxy/PjkJUmx4Y8Y8uICjAlBHIcJo8YwOuC6BX2sgliD3lBf0Vh4Qi3uwvqULdxrSEedGfHjzpWFpbS3D2wUb3847asegL6IKMpC6iFHkGpiwl9QpRCgNEwejvn12QoDt7G1wLJ/Bd4GNC2SEpsiiF3sdUP35C102LhNl14mrtAREw4j7DiDGcBLTVsUggca+4RNoVMgpGPowo+t0hIsh7j/2+3d7yEIM4omAEtFUcC8phpi+JICvcbKatgrEWjMEn2sfY3mThJaOJ71PBFI08rwJHL3pWdZsQ27HNynaPN3uBiml42tjKy78UaR+wC9tqee3y40FxUrj5TTSd7X4adI40usYwSMp+tvXW3EGLlfy8gEdZYoZfW3Wt+nchDJWwOfWd6XASLePF5rXZju94sn1p0TxUYhd9Bevr2+31dNkltmsSbnqxU3s+dDJqzo8+v6BaWYcY6/MKNTBXRN+oxv1iz3knvsPus714PXCZgy+7s3iwo8Vrr6GbTL+9Gyp+Ohl7LcxAlDlJkDhB5EeD4V/0R9XOA2bZjwQx0AXRM01Q+spQ4RVuICoDrk1s4x+7Eb2/SfjpmrZy++lj9FzxBMboO0hvGrRO4h7dLzXeH43/WDzVQ1dlQHdevVGlnJrT67JsFLOSuCjEKz2ZihxOyPU8m4QleDx+dkEWQeanJAYjABOPpNgDXUDSorWmmfjpH8A01TTVbbBuO48gZeNPu+9xjCiDcQZGvCwLw74syNxblkXSzID02ppwIV4NETz+AX4wFto8BwAA",
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
