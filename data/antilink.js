import { serialize } from '../lib/Serializer.js';
import chalk from 'chalk';

/**
 * ──────────────────────────────────────────────────────────────────────────
 * NICK-XMD ANTILINK SYSTEM 🛡️
 * Functionality: Link Detection, Warning, Deletion, and Auto-Kick
 * Status: Advanced & Optimized
 * ──────────────────────────────────────────────────────────────────────────
 */

const antilinkSettings = {}; 

export const handleAntilink = async (m, sock, logger, isBotAdmins, isAdmins, isCreator) => {
    const PREFIX = /^[\\/!#.]/;
    const isCOMMAND = (body) => PREFIX.test(body);
    const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    // --- COMMAND HANDLER ---
    if (cmd === 'antilink') {
        const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);
        const action = args[0] ? args[0].toLowerCase() : '';

        if (!m.isGroup) {
            return await sock.sendMessage(m.from, { 
                text: '❌ *Error:* This command is strictly for groups.' 
            }, { quoted: m });
        }

        if (!isBotAdmins) {
            return await sock.sendMessage(m.from, { 
                text: '🚫 *Bot Permission Error:* I need to be an **Admin** to manage links.' 
            }, { quoted: m });
        }

        if (action === 'on') {
            if (isAdmins) {
                antilinkSettings[m.from] = true;
                await sock.sendMessage(m.from, { 
                    text: '✅ *NICK-XMD:* Antilink has been **ENABLED**.\n🛡️ Security Status: *Active*' 
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.from, { 
                    text: '⚠️ *Access Denied:* Only group admins can toggle security.' 
                }, { quoted: m });
            }
            return;
        }

        if (action === 'off') {
            if (isAdmins) {
                antilinkSettings[m.from] = false;
                await sock.sendMessage(m.from, { 
                    text: '📴 *NICK-XMD:* Antilink has been **DISABLED**.\n🛡️ Security Status: *Inactive*' 
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.from, { 
                    text: '⚠️ *Access Denied:* Admin rights required.' 
                }, { quoted: m });
            }
            return;
        }

        // Help Message
        await sock.sendMessage(m.from, { 
            text: `📝 *ANTILINK CONFIGURATION*\n\n💡 *Usage:* \n└ ${prefix + cmd} on\n└ ${prefix + cmd} off\n\n_Bot will delete links and kick offenders._` 
        }, { quoted: m });
        return;
    }

    // --- DETECTION LOGIC ---
    if (antilinkSettings[m.from]) {
        // Detect WhatsApp Group Links
        if (m.body.match(/(chat.whatsapp.com\/)/gi)) {
            
            if (!isBotAdmins) return; // Silent return if bot isn't admin

            // Check if it's the current group's link
            let gclink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.from)}`;
            let isLinkThisGc = new RegExp(gclink, 'i');
            let isgclink = isLinkThisGc.test(m.body);

            if (isgclink) {
                return; // Allow local group links
            }

            // Exceptions for Admins and Creator
            if (isAdmins) {
                console.log(chalk.blue(`[ANTILINK] Link allowed: Admin shared in ${m.from}`));
                return;
            }
            if (isCreator) {
                return;
            }

            // --- THE ACTION ---
            
            // 1. Send Stylized Warning Message
            await sock.sendMessage(m.from, {
                text: `⚠️ *「 NICK-XMD SECURITY 」* ⚠️\n\n@${m.sender.split("@")[0]} group links are strictly forbidden here.\n\n*Action:* _Message deletion & Removal in 5s..._`,
                contextInfo: { 
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        title: "LINK DETECTED",
                        body: "Security Enforcement Active",
                        thumbnailUrl: "https://files.catbox.moe/kiy0hl.jpg", // Using your bot image
                        sourceUrl: "",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

            // 2. Delete the forbidden link
            await sock.sendMessage(m.from, {
                delete: {
                    remoteJid: m.from,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant
                }
            });

            // 3. Kick after delay (Original 5s maintained)
            setTimeout(async () => {
                try {
                    await sock.groupParticipantsUpdate(m.from, [m.sender], 'remove');
                    console.log(chalk.red(`[ANTILINK] Kicked: ${m.sender} from ${m.from}`));
                } catch (err) {
                    console.log(chalk.yellow(`[ANTILINK] Kick failed: ${err.message}`));
                }
            }, 5000); 
        }
    }
};
