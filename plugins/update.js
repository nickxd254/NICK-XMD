// plugins/update.js
const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { runtime } = require('../lib/functions');

cmd({
  pattern: "update",
  alias: ["updatenow", "sync"],
  use: ".update",
  desc: "Update the bot to the latest version (owner only).",
  category: "owner",
  react: "🆕",
  filename: __filename
},
async (conn, mek, m, { from, quoted, q, react, reply, isSuperUser, isOwner, setCommitHash, getCommitHash }) => {
  try {
    // Owner Check
    if (!isSuperUser && !isOwner) {
      try { await react("❌"); } catch (e) {}
      return reply("*⚠️ ACCESS DENIED*\n\nThis command is reserved for the Bot Owner only.");
    }

    // Repo Settings
    const repoOwner = "nickxd254";
    const repoName = "NICK-XMD";
    const branch = "main";
    const apiCommitUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${branch}`;
    const zipUrl = `https://github.com/${repoOwner}/${repoName}/archive/${branch}.zip`;

    const loadingMsg = await conn.sendMessage(from, { text: "🔍 *NICK-XMD* is checking for updates..." }, { quoted: mek });

    // Fetch latest commit info
    const { data: commitData } = await axios.get(apiCommitUrl, { headers: { "User-Agent": "node.js" } });
    const latestCommitHash = commitData.sha;

    // Fallback commit storage
    const commitFile = path.join(process.cwd(), ".last_update_commit");
    const fallbackGet = async () => {
      try {
        if (fs.existsSync(commitFile)) return fs.readFileSync(commitFile, "utf8").trim();
      } catch (e) { }
      return null;
    };
    const fallbackSet = async (h) => {
      try { fs.writeFileSync(commitFile, String(h), "utf8"); } catch (e) { console.error("Could not save commit hash:", e); }
    };

    const readCurrent = (typeof getCommitHash === "function") ? await getCommitHash() : await fallbackGet();

    if (readCurrent && readCurrent === latestCommitHash) {
      return conn.sendMessage(from, { text: "✅ *UP TO DATE*\n\nYour NICK-XMD instance is already running the latest version." }, { quoted: mek });
    }

    // Update Display
    const authorName = "popkid";
    const authorEmail = "popkid@gmail.com";
    const commitDate = new Date(commitData.commit.author.date).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    const commitMessage = commitData.commit.message || "No description provided.";

    const updateInfo = `🚀 *NICK-XMD UPDATE DETECTED*

╔═══════════════════════╗
  *NEW VERSION AVAILABLE*
╠═══════════════════════╣
  👤 *Author:* ${authorName}
  📅 *Date:* ${commitDate}
  💬 *Message:* ${commitMessage}
  🛠️ *Hash:* ${latestCommitHash.slice(0, 7)}
╚═══════════════════════╝

*📥 Downloading system files...*`;

    await conn.sendMessage(from, { text: updateInfo }, { quoted: mek });

    // Processing Files
    const zipPath = path.join(__dirname, "..", `${repoName}-${branch}.zip`);
    const tmpExtract = path.join(__dirname, "..", "latest_update_tmp");

    const zipRes = await axios.get(zipUrl, { responseType: "arraybuffer", headers: { "User-Agent": "node.js" } });
    fs.writeFileSync(zipPath, zipRes.data);

    // Extraction
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tmpExtract, true);

    const sourcePath = path.join(tmpExtract, `${repoName}-${branch}`);
    const destinationPath = path.join(process.cwd());

    // Syncing folders
    copyFolderSync(sourcePath, destinationPath, [
      "config.js",
      "app.json",
      ".env",
      "session.data.json",
      "session.json",
      "session",
      "sessions",
      "storage.json",
      "node_modules",
    ]);

    // Save state
    if (typeof setCommitHash === "function") {
      try { await setCommitHash(latestCommitHash); } catch (e) { }
    } else {
      await fallbackSet(latestCommitHash);
    }

    // Cleanup
    try { fs.unlinkSync(zipPath); } catch (e) {}
    try { fs.rmSync(tmpExtract, { recursive: true, force: true }); } catch (e) {}

    await conn.sendMessage(from, { text: "✅ *UPDATE SUCCESSFUL*\n\nNICK-XMD has been synchronized with the latest repository changes. Restarting now..." }, { quoted: mek });

    setTimeout(() => {
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error("Update error:", error);
    const errorMsg = error && error.message ? error.message : "Unknown Error";
    await conn.sendMessage(from, { text: `❌ *UPDATE FAILED*\n\n*Error:* ${errorMsg}\n_Please check your server logs or redeploy manually._` }, { quoted: mek });
  }
});

function copyFolderSync(source, target, skipList = []) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  for (const item of fs.readdirSync(source)) {
    if (skipList.includes(item)) continue;

    const src = path.join(source, item);
    const dest = path.join(target, item);
    const stat = fs.lstatSync(src);

    if (stat.isDirectory()) {
      copyFolderSync(src, dest, skipList);
    } else {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
    }
  }
}
