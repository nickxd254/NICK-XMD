/**
 * update.js
 * Converted for Popkid-MD
 * Handles auto-sync with GitHub repository
 */

const { pmd } = require("../pop");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

pmd({
  pattern: "update",
  aliases: ["updatenow", "sync"],
  react: "🆕",
  category: "owner",
  description: "Update the bot to the latest version (owner only).",
}, async (from, Popkid, conText) => {
  const { 
    mek, reply, react, isSuperUser, 
    setCommitHash, getCommitHash, botName 
  } = conText;

  try {
    // 1. Owner Security Check
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    // Repository Settings
    const repoOwner = "hostdeployment-bit";
    const repoName = "xdmuchacho";
    const branch = "main";
    const apiCommitUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${branch}`;
    const zipUrl = `https://github.com/${repoOwner}/${repoName}/archive/${branch}.zip`;

    await Popkid.sendMessage(from, { text: "🔍 Checking for new updates..." }, { quoted: mek });

    // 2. Fetch Latest Commit Info
    const { data: commitData } = await axios.get(apiCommitUrl, { 
      headers: { "User-Agent": "Popkid-MD-Updater" } 
    });
    const latestCommitHash = commitData.sha;

    // Fallback Commit Hash Handling
    const commitFile = path.join(process.cwd(), "pop", ".last_commit");
    const readCurrent = (typeof getCommitHash === "function") 
        ? await getCommitHash() 
        : (fs.existsSync(commitFile) ? fs.readFileSync(commitFile, "utf8").trim() : null);

    if (readCurrent && readCurrent === latestCommitHash) {
      return reply("✅ Your bot is already running the latest version!");
    }

    // 3. Display Update Details
    const commitDate = new Date(commitData.commit.author.date).toLocaleString();
    const commitMessage = commitData.commit.message || "No message provided";

    const updateMsg = `
*🚀 ${botName.toUpperCase()} UPDATE*

📦 *Status:* New Update Found
👤 *Author:* Popkid
📅 *Date:* ${commitDate}
💬 *Message:* ${commitMessage}

_Please wait, downloading and applying files..._`.trim();

    await Popkid.sendMessage(from, { text: updateMsg }, { quoted: mek });

    // 4. Download and Extraction Setup
    const zipPath = path.join(process.cwd(), "pop", `update-${latestCommitHash}.zip`);
    const tmpExtract = path.join(process.cwd(), "pop", "temp_update");

    const zipRes = await axios.get(zipUrl, { 
      responseType: "arraybuffer", 
      headers: { "User-Agent": "Popkid-MD-Updater" } 
    });
    fs.writeFileSync(zipPath, zipRes.data);

    // Extracting ZIP
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tmpExtract, true);

    const sourcePath = path.join(tmpExtract, `${repoName}-${branch}`);
    const destinationPath = process.cwd(); 

    // 5. File Syncing (Preserve sensitive local data)
    const skipList = [
      "config.js",
      "app.json",
      ".env",
      "session",
      "node_modules",
      "package-lock.json",
      "pop/session"
    ];

    copyFolderSync(sourcePath, destinationPath, skipList);

    // 6. Update Commit Hash Storage
    if (typeof setCommitHash === "function") {
      await setCommitHash(latestCommitHash);
    } else {
      fs.writeFileSync(commitFile, latestCommitHash, "utf8");
    }

    // Cleanup Temporary Files
    try {
      fs.unlinkSync(zipPath);
      fs.rmSync(tmpExtract, { recursive: true, force: true });
    } catch (e) {}

    await Popkid.sendMessage(from, { 
      text: "✅ Update successful! The bot will now restart to apply changes..." 
    }, { quoted: mek });

    // Restart the Bot
    setTimeout(() => {
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error("Update error:", error);
    reply(`❌ Update Failed: ${error.message}`);
  }
});

// Helper Function: Recursive Folder Copy
function copyFolderSync(source, target, skipList = []) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  const items = fs.readdirSync(source);
  for (const item of items) {
    if (skipList.includes(item)) continue;

    const src = path.join(source, item);
    const dest = path.join(target, item);

    if (fs.lstatSync(src).isDirectory()) {
      copyFolderSync(src, dest, skipList);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}
