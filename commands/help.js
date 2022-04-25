const _ = require('lodash');

module.exports = {
    name: 'help',
    description: 'Shows a list of commands.',
    aliases: ['commands'],
    usage: '[command name]',
    category: 'Info',
    cooldown: 0,
    async execute(client, message, args, Discord) {
        let embed = new Discord.MessageEmbed();
        let commandQuery = args[0];
        if (commandQuery) {
            let command = client.commandList.find(c => c.name.toLowerCase() === commandQuery.toLowerCase() || c.aliases.map(a => a.toLowerCase()).includes(commandQuery.toLowerCase()));
            if (command) {
                embed.setTitle(`${command.name} - Command Info`);
                embed.setDescription(command.description);
                if (command.aliases.length !== 0) embed.addField('Aliases', command.aliases.join(', '), true);
                embed.addField('Usage', `\`${client.config.prefix}${command.name}${command.usage ? ` ${command.config.usage}` : ''}\``, true);
                embed.addField('Category', command.category, true);
                embed.setFooter(message.author.username, message.author.displayAvatarURL())
                embed.setTimestamp();
                embed.setColor(client.config.colors.neutral);
                return message.channel.send(embed);
            }
        }

        let categories = _.groupBy(client.commandList, c => c.category);
        for (const categoryName of Object.keys(categories)) {
            let category = categories[categoryName];
            let commandString = category.map(c => `\`${client.config.prefix}${c.name}${c.usage ? ` ${c.usage}` : ''}\` - ${c.description}`).join('\n');
            embed.addField(`${categoryName}`, `${commandString}`);
        }
        embed.setDescription('Here is a list of the bot commands:');
        embed.setFooter(message.author.username, message.author.displayAvatarURL())
        embed.setTimestamp();
        embed.setColor(client.config.colors.neutral);
        return message.channel.send(embed);
    }
}