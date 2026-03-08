const fs = require('fs-extra');
if (fs.existsSync('.env'))
  require('dotenv').config({ path: __dirname + '/.env' });
const path = require("path");

module.exports = { 
    SESSION_ID: process.env.SESSION_ID || 'POPKID~;;;H4sIAAAAAAAAA5VUy5KiSBT9lY7czEKjCxQUjKiI4SWgUqL4KJ3oRQoJpEKCmQmKHfUTs5jt/OJ8wgRWVXcvZnpqWCU3b9x77jnn5ldACszQFDVg9BWUFNeQo/bImxKBEdCrOEYUdEEEOQQj0LHTwX59CZrx1vJwgHb+MVK1Yw4r11/PQlJSJ5hHZ7lZLx7BSxeU1SHD4U8Krlb7ZWd5kJdJHkjyxtzs62utTijxe4mJvWzT5Hgvu+vnXHgEL21FiCkmiVWmKEcUZlPU+BDTj8G3x7nW990AXhNHrWx27Wh6EU8OdZSsne08U/e8P/Yvl85a+hh8OS9KlzDRTstAe17rvKL76EG8SLuyONA5r86wEfLt1U+tV/gMJwRFboQIx7z5MO9Im0nEmoe6nZ476fKmsodwXXrTzViTMiauZtZC2Z2sOdkIHwNuZRMtVLfTXKYOCupDk+1WRg6XqKkegrkGj72ipNbKoYn0I3Cfvnvl9H94lyxRMUJ908zV4TE9Tfd5h9SCX9ul0GNl6M5TtM+pmU2yy8fg67Gg7AYmUYVa9q6LWqluSadeFoKXnKk5641zZ3BwNh3R+AE+5BX9GUo3OSzDoOHYRnh6Q50n3xStUJt5aJ5l2cHPkyQl+n7BDxz3YzMe7zdX+WYuJEVgYQc2W7wpm0ry9EFwNur+0jr10PHyeJ/ohBo3AiPxpQsoSjDjFHJckDamyF0AozpAIUX8zi5QY2RK44d46R7EDpoWiW6i5+0sw8i7TrTD2MYCqvecqth7BF1Q0iJEjKHIwYwXtPEQYzBBDIx++9IFBF35q25tt77YBTGmjK9JVWYFjN5Ffb+EYVhUhAcNCY32gCgYCd/DiHNMEtbSWBFIwxTXyEghZ2AUw4yhbwMiiiIw4rRC35bWKKKWd83Xt9LTcAe6IL/rgSMwAj1ZGgqD/kDoS+JIUn5lny9tWViWnwnioAuye1pf6SmqIiqCLCmy0Ca28S4gsK0FnnB4+oV9YgX59Nefv//RUv+GvG0UIQ5xxsAIGF6e95W1bXmxxz3BtvVdohmJBr5P+u6YV0nEgXPLr+O+Kznn8yXZWtWDfzmaNNgG7iUIn4/BFFXj024eKI//UASMgEI7JleG8lqeBincnQc3++YYJ2UsbRd7MT46T6v1ZM1hmJrD1eRi7i7WZWuoG9rwIlrjWR5dm3gyvF3RYjnLYpj4WaQlj223CNU4RD82cw7Lm6NLhy0ars6eFNi24c30Z/9BnaZK0VM2QyMzF1lMBPakMrSUtp4ruWVvevOnq6dI4vP+7SEhsRkOBjdiKMVij5Lk1cv3Xcre3jB8t1mrYfsbY3R/Et7U+E9NX4G31hNeuj/UeHtk/m37I5QqMltGzVwfnJk7Tmf1TXEvAyE7Yc8iY0nAhKZ72zzV4OXlSxeUGeRxQXMwApBEtLhbhhZV62WXxMVPmhm66+qL5KmdPIOMa9/3Y4VzxDjMSzASh8OeKss9cfia5dOidCBLW+dMpdSRWrM3WlkGHPL3dQNa+43JFbz8DTHYmEGJBwAA',
    PREFIX: process.env.PREFIX || ".",
    OWNER_NAME: process.env.OWNER_NAME || "𝐏𝐎𝐏𝐊𝐈𝐃",
    OWNER_NUMBER : process.env.OWNER_NUMBER || "",  // put only one number
    SUDO_NUMBERS : process.env.SUDO_NUMBERS || "", // can be multiple numbers separated by commas
    BOT_NAME : process.env.BOT_NAME || '𝐏𝐎𝐏𝐊𝐈𝐃 𝐗𝐓𝐑',
    FOOTER : process.env.FOOTER || 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ',
    CAPTION : process.env.CAPTION || '𝐏𝐎𝐏𝐊𝐈𝐃 𝐁𝐎𝐓',
    VERSION: process.env.VERSION || '5.0.0',
    BOT_PIC : process.env.BOT_PIC || 'https://i.ibb.co/fTCrW08/373b5c2300fc0f90e39b3797f2db358b.jpg',            
    MODE: process.env.MODE || "private",
    PM_PERMIT: process.env.PM_PERMIT || 'false',
    WARN_COUNT : process.env.WARN_COUNT || '3' ,
    TIME_ZONE: process.env.TIME_ZONE || "Africa/Nairobi",
    DM_PRESENCE : process.env.DM_PRESENCE || 'online', // recording/typing/online/offline
    GC_PRESENCE : process.env.GC_PRESENCE || 'online', // recording/typing/online/offline
    CHATBOT : process.env.CHATBOT || 'false', // can be true/audio/false   
    CHATBOT_MODE : process.env.CHATBOT_MODE || 'inbox', // can be inbox/groups/allchats
    STARTING_MESSAGE : process.env.STARTING_MESSAGE || "true",
    ANTIDELETE : process.env.ANTIDELETE || 'indm', // inchat/indm/false
    GOODBYE_MESSAGE : process.env.GOODBYE_MESSAGE || 'false',
    ANTICALL : process.env.ANTICALL || 'false', // (decline/true)/block/false
    ANTICALL_MSG: process.env.ANTICALL_MSG || "*_📞 Auto Call Reject Mode Active. 📵 No Calls Allowed!_*",
    WELCOME_MESSAGE : process.env.WELCOME_MESSAGE || 'false',
    ANTILINK : process.env.ANTILINK || 'false', // or delete or kick or true
    AUTO_LIKE_STATUS : process.env.AUTO_LIKE_STATUS || 'true',
    AUTO_READ_STATUS : process.env.AUTO_READ_STATUS || 'true',
    STATUS_LIKE_EMOJIS : process.env.STATUS_LIKE_EMOJIS || "💛,❤️,💜,🤍,💙",
    AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS || "false",   
    STATUS_REPLY_TEXT: process.env.STATUS_REPLY_TEXT || "*ʏᴏᴜʀ sᴛᴀᴛᴜs ᴠɪᴇᴡᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ ✅*",             
    AUTO_REACT : process.env.AUTO_REACT || 'false',
    AUTO_REPLY : process.env.AUTO_REPLY || 'false',
    AUTO_READ_MESSAGES : process.env.AUTO_READ_MESSAGES || 'false', // true/commands/false
    AUTO_BIO : process.env.AUTO_BIO || 'false',
    AUTO_BLOCK: process.env.AUTO_BLOCK || '212,233',
    YT: process.env.YT || 'youtube.com/@pop_kid254',
    NEWSLETTER_JID: process.env.NEWSLETTER_JID || '120363419140572186@newsletter',
    NEWSLETTER_URL: process.env.NEWSLETTER_URL || 'https://whatsapp.com/channel/0029VbBTlzoLtOjGXhhD4I2d',
    BOT_REPO: process.env.BOT_REPO || 'kenyanpopkid/POPKID-XTR',
    PACK_NAME: process.env.PACK_NAME || '𝐏𝐎𝐏𝐊𝐈𝐃 𝐗𝐓𝐑',
    PACK_AUTHOR: process.env.PACK_AUTHOR || '𝐏𝐎𝐏𝐊𝐈𝐃'
};

let fileName = require.resolve(__filename);
fs.watchFile(fileName, () => {
    fs.unwatchFile(fileName);
    console.log(`Writing File: ${__filename}`);
    delete require.cache[fileName];
    require(fileName);
});
