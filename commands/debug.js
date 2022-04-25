let os = require('os')
let cpuStat = require("cpu-stat")
const moment = require("moment");
require("moment-duration-format");

module.exports = {
    name: 'debug',
    description: "Shows the debug info of the bot.",
    aliases: ['info'],
    usage: '',
    category: 'Utilities',
    cooldown: 0,
    async execute(client, message, args, Discord) {
        const embed = new Discord.MessageEmbed()
            .setTitle(`Debugging...`)
            .setColor(client.config.colors.neutral)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL())
        const msg = await message.channel.send(embed);
        cpuStat.usagePercent(async function (err, percent, seconds) {
            if (err) {
                return console.log(err);
            }
            const duration = moment.duration(message.client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
            embed.setColor(client.config.colors.neutral)
                .setTitle(`Debug Information`)
                .addField("Shard ID", `#${message.guild.shardID}`, true)
                .addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`, true)
                .addField("Operating System", `${os.type()} (${os.arch()})`, true)
                .addField("CPU", `${os.cpus().map(i => `${i.model}`)[0]}`, true)
                .addField("CPU usage", `\`${percent.toFixed(2)}%\``, true)
                .addField("Uptime ", `${duration}`, true)
                .setTimestamp()
            msg.edit(embed);
        })
    }
}