/** * NICK-XMD Command Handler 
 */
var commands = [];

function cmd(info, func) {
    var data = info;
    data.function = func;
    if (!data.alias) data.alias = [];
    if (!data.category) data.category = 'misc';
    if (!data.desc) data.desc = '';
    if (!data.react) data.react = '✅';
    if (!data.filename) data.filename = "Not Found";
    commands.push(data);
    return data;
}

module.exports = {
    cmd,
    commands
};
