const { gmd } = require("../pop");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");

gmd({
    pattern: "update",
    alias: ["updatenow", "updt", "sync", "update now"],
    react: '✨',
    desc: "Update the bot to the latest version.",
    category: "owner",
    filename: __filename
}, async (from, Gifted, conText) => {
  const { q, mek, react, reply, isSuperUser, setCommitHash, getCommitHash } = conText;
    
  if (!isSuperUser) {
    await react("⛔");
    return reply("⛔ Owner Only Command — access denied!");
  }
  
  try {
    await reply("🔎 Checking for updates...");

    const { data: commitData } = await axios.get("https://api.github.com/repos/popkidfree/Test/commits/main");
    const latestCommitHash = commitData.sha;

    const currentHash = await getCommitHash();

    if (latestCommitHash === currentHash) {
      return reply("💝 Your Popkid-Md Bot is already on the latest version — no update needed!");
    }

    const authorName = commitData.commit.author.name;
    const authorEmail = commitData.commit.author.email;
    const commitDate = new Date(commitData.commit.author.date).toLocaleString();
    const commitMessage = commitData.commit.message;

    await reply(
      `🔄 Preparing update — downloading latest commit...\n\n` +
      `*Commit Summary*\n` +
      `👤 Author: ${authorName} (${authorEmail})\n` +
      `📅 Date: ${commitDate}\n` +
      `💬 Message: ${commitMessage}\n\n` +
      `📦 Downloading package — hang tight 🚀`
    );

    const zipPath = path.join(__dirname, '..', 'Test-main.zip');
    const { data: zipData } = await axios.get("https://github.com/popkidfree/Test/archive/main.zip", { responseType: "arraybuffer" });
    fs.writeFileSync(zipPath, zipData);

    const extractPath = path.join(__dirname, '..', 'latest');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    const sourcePath = path.join(extractPath, 'Test-main');
    const destinationPath = path.join(__dirname, '..');
    copyFolderSync(sourcePath, destinationPath);
    await setCommitHash(latestCommitHash);

    // cleanup
    try { fs.unlinkSync(zipPath); } catch (e) { /* ignore */ }
    try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch (e) { /* ignore */ }

    await reply("✅ Update complete! Bot will restart now 🔁");

    setTimeout(() => {
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error("Update error:", error);
    return reply("❌ Update failed. Please try redeploying manually or check logs.");
  }
});

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);
  for (const item of items) {
    const srcPath = path.join(source, item);
    const destPath = path.join(target, item);

    if (item === "config.js" || item === "app.json") {
      console.log(`🔐 Skipping ${item} — preserving local settings.`);
      continue;
    }

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
