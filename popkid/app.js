const { gmd } = require("../pop");
const axios = require("axios");

gmd({
  pattern: "app",
  aliases: ["apk", "modapk"],
  react: "📦",
  category: "download",
  description: "Download APK files from Aptoide.",
  use: ".app <app name>",
}, async (from, Gifted, conText) => {
  const { mek, reply, react, args, sender, newsletterJid, botName } = conText;

  const query = args.join(" ");
  if (!query)
    return reply("❌ Please provide an app name to search.\n💡 Example: *.app whatsapp*");

  // React with hourglass to show loading
  await react("⏳");

  try {
    const sanitized = query.replace(/[^a-zA-Z0-9\\s]/g, "");
    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${sanitized}/limit=1`;
    const { data } = await axios.get(apiUrl);

    const app = data?.datalist?.list?.[0];
    if (!app)
      return reply("⚠️ No results found for the given app name.");

    const appSizeMB = (app.size / 1048576).toFixed(2);

    const apkInfo = `
╭─⧉  *APK Downloader*
│
│ 📦 *Name:* ${app.name}
│ 🏷 *Package:* ${app.package}
│ 📅 *Updated:* ${app.updated}
│ 🧮 *Size:* ${appSizeMB} MB
│
╰────⟡ *Powered by Popkid-AI*
`.trim();

    // Send app info message
    await Gifted.sendMessage(
      from,
      {
        text: apkInfo,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: botName,
            serverMessageId: 143,
          },
        },
      },
      { quoted: mek }
    );

    // Send the APK file
    await Gifted.sendMessage(
      from,
      {
        document: { url: app.file.path_alt },
        fileName: `${app.name}.apk`,
        mimetype: "application/vnd.android.package-archive",
        caption: "✅ *Here is the APK file you requested.*",
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: botName,
            serverMessageId: 143,
          },
        },
      },
      { quoted: mek }
    );

    await react("✅");
  } catch (err) {
    console.error("[APK Downloader Error]", err.message);
    await reply("❌ An error occurred while fetching the APK. Please try again later.");
    await react("❌");
  }
});
