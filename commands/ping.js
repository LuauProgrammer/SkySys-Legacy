const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'ping',
    description: "Shows the ping of the bot.",
    aliases: ['latency'],
    usage: '',
    category: 'Utilities',
    cooldown: 0,
    async execute(client, message, args, Discord) {
        const embed = new MessageEmbed()
            .setTitle(`Pinging...`)
            .setColor(client.config.colors.neutral)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL())
        const msg = await message.channel.send(embed);
        const timestamp = (message.editedTimestamp) ? message.editedTimestamp : message.createdTimestamp;
        const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - timestamp)}ms ]\`\`\``;
        const apiLatency = `\`\`\`ini\n[ ${Math.round(message.client.ws.ping)}ms ]\`\`\``;
        embed.setTitle(`Pong! 🏓`)
            .addField('Latency', latency, true)
            .addField('API Latency', apiLatency, true)
            .setColor(client.config.colors.success)
            .setTimestamp();
        msg.edit(embed);
    }
}