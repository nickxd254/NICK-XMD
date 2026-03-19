import os from 'os';

export default async function(Matrix, m, { command, isCmd, from }) {
    if (!isCmd || command !== 'ping') return;

    const start = Date.now();
    
    // First message to initiate timing
    const { key } = await Matrix.sendMessage(from, { text: '🚀 *Pinging Nick-XMD...*' }, { quoted: m });
    
    const end = Date.now();
    const latency = end - start;

    // Edit or send a follow-up with the actual speed
    await Matrix.sendMessage(from, { 
        text: `*NICK-XMD PING REPORT* 📡\n\n` +
             `⚡ *Latency:* ${latency}ms\n` +
             `💻 *Platform:* ${os.platform()}\n` +
             `🧠 *Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        edit: key 
    }, { quoted: m });
}
