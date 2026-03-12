const { pmd } = require("../pop");
const config = require("../config");

// Track if the listener is already active to prevent double-typing
global.autotypeActive = global.autotypeActive || false;

pmd({
    pattern: "autotyping",
    aliases: ["autotype", "typing", "type"],
    react: "⌨️",
    category: "owner",
    description: "Toggle automatic typing presence",
}, async (from, Popkid, conText) => {
    const { reply, isSuperUser, args, react, q } = conText;

    try {
        if (!isSuperUser) return reply(`❌ Owner Only Command!`);

        // Get the input (on/off) accurately
        const input = (q || (args && args[0]) || "").toLowerCase().trim();

        if (input === "on") {
            config.DM_PRESENCE = 'typing';
            
            // 🎯 THE MAGIC: Attach the listener directly here if not already active
            if (!global.autotypeActive) {
                Popkid.ev.on('messages.upsert', async (chatUpdate) => {
                    const mek = chatUpdate.messages[0];
                    if (!mek.message || mek.key.fromMe) return;

                    // Only send 'composing' (typing) if the config says so
                    if (config.DM_PRESENCE === 'typing') {
                        await Popkid.sendPresenceUpdate('composing', mek.key.remoteJid);
                    }
                });
                global.autotypeActive = true; 
            }

            await react("✅");
            return reply("✅ *Autotyping is now LIVE.*\nThe bot is now watching for messages to show 'typing...'");
            
        } else if (input === "off") {
            config.DM_PRESENCE = 'online';
            await react("❌");
            return reply("❌ *Autotyping Disabled.*");
            
        } else {
            const status = (config.DM_PRESENCE === 'typing') ? "ON" : "OFF";
            return reply(`*Usage:* .autotyping on/off\n*Current Status:* ${status}`);
        }
    } catch (error) {
        console.error("Autotyping Error:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});
