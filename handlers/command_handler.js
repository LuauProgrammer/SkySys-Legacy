const fs = require('fs')

module.exports = (client, Discord) => {
    let commandList = [];
    client.commandList = commandList;
    const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        commandList.push({
            file: command,
            name: file.split('.')[0],
            description: command.description,
            aliases: command.aliases,
            usage: command.usage,
            category: command.category
        });
        client.commands.set(command.name, command)
        if (command.name) {
            client.commands.set(command.name, command)
        } else {
            continue;
        }
    }
}