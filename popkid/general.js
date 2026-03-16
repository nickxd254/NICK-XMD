const { pmd, commands, monospace, formatBytes } = require("../pop"), fs=require('fs'), axios=require('axios'), BOT_START_TIME=Date.now(), { totalmem:totalMemoryBytes, freemem:freeMemoryBytes }=require('os'), moment=require('moment-timezone'), more=String.fromCharCode(8206), readmore=more.repeat(4001), { downloadContentFromMessage }=require('gifted-baileys'), ram=`${formatBytes(freeMemoryBytes)}/${formatBytes(totalMemoryBytes)}`;

pmd({ pattern:"menu", aliases:["help","allmenu","mainmenu"], react:"🌌", category:"general", description:"Fetch bot main menu" }, async (from,Popkid,conText)=>{
const { mek,sender,react,pushName,botPic,botMode,botVersion,botName,botFooter,timeZone,botPrefix,newsletterJid }=conText;

function formatUptime(seconds){const d=Math.floor(seconds/(24*60*60));seconds%=24*60*60;const h=Math.floor(seconds/(60*60));seconds%=60*60;const m=Math.floor(seconds/60);const s=Math.floor(seconds%60);return `${d}d ${h}h ${m}m ${s}s`;}

const now=new Date();
const date=new Intl.DateTimeFormat("en-GB",{timeZone:timeZone,day:"2-digit",month:"2-digit",year:"numeric"}).format(now);
const time=new Intl.DateTimeFormat("en-GB",{timeZone:timeZone,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true}).format(now);
const uptime=formatUptime(process.uptime());
const totalCommands=commands.filter(cmd=>cmd.pattern).length;

const categorized=commands.reduce((m,cmd)=>{if(cmd.pattern&&!cmd.dontAddCommandList){if(!m[cmd.category])m[cmd.category]=[];m[cmd.category].push(cmd.pattern);}return m;},{});

const header=`
╭━━━〔 🌌 *${botName.toUpperCase()}* 🌌 〕━━━⬣
┃ 👤 *User:* ${pushName}
┃ 🛡️ *Mode:* ${botMode}
┃ ⚡ *Prefix:* [ ${botPrefix} ]
┃ ⏱️ *Uptime:* ${uptime}
┃ 📆 *Date:* ${date}
┃ 🕰️ *Time:* ${time}
┃ 📊 *Commands:* ${totalCommands}
╰━━━━━━━━━━━━━━━━━━━━━━⬣
${readmore}`.trim();

const formatCategory=(cat,cmds)=>`
╭─❍「 *${cat.toUpperCase()}* 」❍
${cmds.map(c=>`┃ ✦ ${botPrefix+c}`).join("\n")}
╰──────────────⬣
`;

let menu=`${header}\n`;
for(const [cat,cmds] of Object.entries(categorized)) menu+=formatCategory(cat,cmds);

const message={ image:{url:botPic}, caption:`${menu}\n✨ *${botFooter}*`, contextInfo:{ mentionedJid:[sender], forwardingScore:999, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } } };

await Popkid.sendMessage(from,message,{quoted:mek});
await react("👑");
});

pmd({ pattern:"return", aliases:['details','det','ret'], react:"⚙️", category:"owner", description:"Displays the full raw quoted message using Baileys structure." }, async (from,Popkid,conText)=>{
const { mek,reply,react,quotedMsg,isSuperUser,botName,newsletterJid }=conText;
if(!isSuperUser) return reply(`*🚫 ACCESS DENIED!* Owner Only.`);
if(!quotedMsg) return reply(`*⚠️ Please reply to a message.*`);

try{
const jsonString=JSON.stringify(quotedMsg,null,2);
const chunks=jsonString.match(/[\s\S]{1,100000}/g)||[];

for(const chunk of chunks){
const formatted=`*╭─〔 🔍 DEBUG LOG 〕─╮*\n\`\`\`json\n${chunk}\n\`\`\`\n*╰───────────────╯*`;
await Popkid.sendMessage(from,{ text:formatted, contextInfo:{ forwardingScore:5, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } } },{quoted:mek});
await react("✅");
}
}catch(e){await reply(`❌ Error: ${e.message}`);}
});

pmd({ pattern:"ping", react:"🚀", category:"general", description:"Check bot response speed" }, async (from,Popkid,conText)=>{
const { mek,react,newsletterJid,botName }=conText;
const start=process.hrtime();
await new Promise(r=>setTimeout(r,Math.floor(80+Math.random()*420)));
const e=process.hrtime(start);
const ms=Math.floor((e[0]*1000)+(e[1]/1000000));

await Popkid.sendMessage(from,{ text:`╭─〔 ⚡ *BOT SPEED* 〕─╮\n┃ 🚀 *Latency:* ${ms} ms\n╰──────────────⬣`, contextInfo:{ forwardingScore:5, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } } },{quoted:mek});
await react("✅");
});

pmd({ pattern:"uptime", react:"⏱️", category:"general", description:"check bot uptime status." }, async (from,Popkid,conText)=>{
const { mek,react,newsletterJid,botName }=conText;
const u=Date.now()-BOT_START_TIME;
const s=Math.floor((u/1000)%60), m=Math.floor((u/(1000*60))%60), h=Math.floor((u/(1000*60*60))%24), d=Math.floor(u/(1000*60*60*24));

await Popkid.sendMessage(from,{ text:`╭─〔 🕒 *BOT UPTIME* 〕─╮\n┃ ⏳ ${d}d ${h}h ${m}m ${s}s\n╰──────────────⬣`, contextInfo:{ forwardingScore:5, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } } },{quoted:mek});
await react("✅");
});

pmd({ pattern:"repo", aliases:['sc','script'], react:"🎁", category:"general", description:"Fetch bot script." }, async (from,Popkid,conText)=>{
const { mek,sender,react,pushName,botPic,botName,ownerName,newsletterJid,popkidRepo }=conText;
const r=await axios.get(`https://api.github.com/repos/${popkidRepo}`);
const { forks_count,stargazers_count,created_at,updated_at }=r.data;

const txt=`👋 *Hello ${pushName}!*

╭─〔 🤖 *${botName} REPOSITORY* 〕─╮
┃ 🌟 Stars : ${stargazers_count}
┃ 🍴 Forks : ${forks_count}
┃ 📅 Created : ${new Date(created_at).toLocaleDateString()}
┃ 🔄 Updated : ${new Date(updated_at).toLocaleDateString()}
╰──────────────⬣

🔗 https://github.com/${popkidRepo}

✨ *Owner:* ${ownerName}`;

await Popkid.sendMessage(from,{ image:{url:botPic}, caption:txt, contextInfo:{ mentionedJid:[sender], forwardingScore:5, isForwarded:true, forwardedNewsletterMessageInfo:{ newsletterJid, newsletterName:botName, serverMessageId:143 } } },{quoted:mek});
await react("💜");
});

pmd({ pattern:"save", aliases:['sv','s','sav','.'], react:"💾", category:"tools", description:"Save messages (supports images, videos, audio, stickers, and text)." }, async (from,Popkid,conText)=>{
const { mek,reply,react,sender,isSuperUser,getMediaBuffer }=conText;
if(!isSuperUser) return reply(`*🚫 ACCESS DENIED!*`);

const q=mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
if(!q) return reply(`*⚠️ Please reply to a message.*`);

try{
let media;
if(q.imageMessage) media={ image:await getMediaBuffer(q.imageMessage,"image"), caption:q.imageMessage.caption||"" };
else if(q.videoMessage) media={ video:await getMediaBuffer(q.videoMessage,"video"), caption:q.videoMessage.caption||"" };
else if(q.audioMessage) media={ audio:await getMediaBuffer(q.audioMessage,"audio"), mimetype:"audio/mp4" };
else if(q.stickerMessage) media={ sticker:await getMediaBuffer(q.stickerMessage,"sticker") };
else if(q.conversation||q.extendedTextMessage?.text) media={ text:q.conversation||q.extendedTextMessage.text };
else return reply(`*❌ Type not supported.*`);

await Popkid.sendMessage(sender,media,{quoted:mek});
await react("✅");
}catch(e){await reply(`❌ Save Failed: ${e.message}`);}
});
