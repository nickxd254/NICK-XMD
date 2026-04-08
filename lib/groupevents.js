const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

// Helper for consistent message styling
const getContextInfo = (participant) => {
    return {
        mentionedJid: [participant],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363289379419860@newsletter',
            newsletterName: 'popkid🌟',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'
];

const GroupEvents = async (conn, update) => {
    try {
        const { id, participants, action, author } = update;
        
        // Safety check
        if (!id || !isJidGroup(id)) return;

        // Fetch fresh metadata to get accurate member counts and description
        const metadata = await conn.groupMetadata(id);
        const groupName = metadata.subject;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        // Get Group Profile Picture
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(id, 'image');
        } catch {
            ppUrl = ppUrls[0]; // Fallback
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' });

            // --- WELCOME ---
            if (action === "add" && config.WELCOME === "true") {
                const WelcomeText = `Hey @${userName} 👋\n\n` +
                    `Welcome🎉 to *${groupName}*.\n` +
                    `You are member number *${groupMembersCount}*. 🙏\n\n` +
                    `*Joined:* ${timestamp}\n\n` +
                    `*Group Description:*\n${desc}\n\n` +
                    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ ᴛᴇᴄʜ 🌟*`;

                await conn.sendMessage(id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo(num),
                });
            } 
            
            // --- GOODBYE ---
            else if (action === "remove" && config.GOODBYE === "true") {
                const GoodbyeText = `Goodbye @${userName}. 😔\n\n` +
                    `We will miss you! The group now has *${groupMembersCount}* members. 😭\n\n` +
                    `*Left at:* ${timestamp}\n\n` +
                    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ ᴛᴇᴄʜ 🌟*`;

                await conn.sendMessage(id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo(num),
                });
            } 
            
            // --- ADMIN EVENTS ---
            else if ((action === "demote" || action === "promote") && config.ADMIN_EVENTS === "true") {
                const isPromote = action === "promote";
                const effector = author ? author.split("@")[0] : "System";
                
                const adminText = `*ADMIN EVENT DETECTED* 🛡️\n\n` +
                    `*Action:* ${isPromote ? "Promoted to Admin 🎉" : "Demoted from Admin 👀"}\n` +
                    `*User:* @${userName}\n` +
                    `*By:* @${effector}\n` +
                    `*Time:* ${timestamp}`;

                await conn.sendMessage(id, {
                    text: adminText,
                    mentions: [author || id, num],
                    contextInfo: getContextInfo(num),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
