const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || "",
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
    ANTI_CALL: process.env.ANTI_CALL || "false",
    CUSTOM_STATUS_EMOJIS: process.env.CUSTOM_STATUS_EMOJIS || "❤️,✨,🔥,💯,👑",
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*𝐏𝐎𝐏𝐊𝐈𝐃 𝐌𝐃 𝐕𝐈𝐄𝐖𝐄𝐃✅*",

    // ====== Anti-Delete Config ======
    ANTI_DELETE: process.env.ANTI_DELETE || "false",       // true/false to enable anti-delete
    ANTI_DELETE_DM: process.env.ANTI_DELETE_DM || "false", // true = send recovered messages to owner DM, false = same chat
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log",     // optional path for logging recovered messages

    WELCOME: process.env.WELCOME || "false",
    ADMIN_EVENTS: process.env.ADMIN_EVENTS || "true",
    LINK_WHITELIST: "youtube.com,github.com",
    LINK_ACTION: "mute",
    LINK_WARN_LIMIT: 3,
    ANTI_LINK: process.env.ANTI_LINK || "false",
    MENTION_REPLY: process.env.MENTION_REPLY || "false",
    MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/rw2g9x.jpg",
    PREFIX: process.env.PREFIX || ".",
    AUTO_BIO: process.env.AUTO_BIO || "true",
    TIME_ZONE: process.env.TIME_ZONE || "Asia/Kolkata",
    BOT_NAME: process.env.BOT_NAME || "𝐏𝐎𝐏𝐊𝐈𝐃 𝐌𝐃",
    STICKER_NAME: process.env.STICKER_NAME || "𝐏𝐎𝐏𝐊𝐈𝐃 𝐌𝐃",
    CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
    CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
    DELETE_LINKS: process.env.DELETE_LINKS || "true",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "254732297194",
    OWNER_NAME: process.env.OWNER_NAME || "𝐏𝐎𝐏𝐊𝐈𝐃",
    DESCRIPTION: process.env.DESCRIPTION || "*𝙿𝙾𝙿𝙺𝙸𝙳 𝚇𝙼𝙳 𝙱𝙾𝚃😇*",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/rw2g9x.jpg",
    LIVE_MSG: process.env.LIVE_MSG || "> 𝐏𝐎𝐏𝐊𝐈𝐃 𝐌𝐃 𝐁𝐎𝐓😇",
    READ_MESSAGE: process.env.READ_MESSAGE || "false",
    AUTO_REACT: process.env.AUTO_REACT || "false",
    ANTI_BAD: process.env.ANTI_BAD || "true",
    MODE: process.env.MODE || "public",
    ANTI_LINK_KICK: process.env.ANTI_LINK_KICK || "false",
    AUTO_STICKER: process.env.AUTO_STICKER || "false",
    AUTO_REPLY: process.env.AUTO_REPLY || "false",
    ANTI_LINK_MODE: process.env.ANTI_LINK_MODE || "warn",
    ANTI_LINK_WARN_MSG: process.env.ANTI_LINK_WARN_MSG || "⚠️ Links are not allowed in this group.",
    ANTI_LINK_KICK_MSG: process.env.ANTI_LINK_KICK_MSG || "🚪 You have been removed for sending links.",
    ANTI_LINK_DELETE_MSG: process.env.ANTI_LINK_DELETE_MSG || "🗑️ Link message deleted.",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
    PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
    AUTO_TYPING: process.env.AUTO_TYPING || "true",
    READ_CMD: process.env.READ_CMD || "false",
    DEV: process.env.DEV || "254732297194",
    ANTI_VV: process.env.ANTI_VV || "true",
    AUTO_RECORDING: process.env.AUTO_RECORDING || "false"
};
