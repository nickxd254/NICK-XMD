import config from '../config.cjs';
import chalk from 'chalk';

/**
 * ──────────────────────────────────────────────────────────────────────────
 * NICK-XMD CALL HANDLER 📵
 * Functionality: Automatic Call Rejection & Notification
 * Status: Active & Styled
 * ──────────────────────────────────────────────────────────────────────────
 */

const Callupdate = async (json, sock) => {
   for (const id of json) {
      // Check if the call is an incoming offer and if the feature is enabled in config
      if (id.status === 'offer' && config.REJECT_CALL) {
         
         // Stylish notification sent to the caller
         await sock.sendMessage(id.from, {
            text: `⚠️ *「 NICK-XMD SECURITY 」* ⚠️\n\n*🚫 CALL REJECTED*\n_System is currently in Do Not Disturb mode._\n\n💡 *Note:* Please send a text message instead.`,
            contextInfo: {
                mentionedJid: [id.from],
                externalAdReply: {
                    title: "INCOMING CALL REJECTED",
                    body: "Nick-XMD Security Enforcement",
                    thumbnailUrl: "https://files.catbox.moe/kiy0hl.jpg", // Using your bot image
                    sourceUrl: "",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
         });

         // Logic to perform the actual rejection
         try {
            await sock.rejectCall(id.id, id.from);
            console.log(chalk.red(`[CALL-HANDLER] Rejected call from: ${id.from}`));
         } catch (err) {
            console.log(chalk.yellow(`[CALL-HANDLER] Error rejecting call: ${err.message}`));
         }
      }
   }
};

export default Callupdate;
