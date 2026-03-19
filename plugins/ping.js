export default async function(Matrix, m, { command, isCmd, from }) {
    // 1. Only respond if the command is exactly 'ping'
    if (command !== 'ping') return;

    // 2. Start the timer
    const start = Date.now();

    // 3. Send an initial message
    const { key } = await Matrix.sendMessage(from, { text: '🚀 *Checking Speed...*' }, { quoted: m });

    // 4. Calculate the difference
    const end = Date.now();
    const responseTime = end - start;

    // 5. Update the message with the final result
    await Matrix.sendMessage(from, { 
        text: `*NICK-XMD RESPONSE* ⚡\n\nSpeed: ${responseTime}ms\nStatus: Online ✅`,
        edit: key 
    }, { quoted: m });
}
