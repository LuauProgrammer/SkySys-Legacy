const mongo = require('../mongo')

module.exports = {
    name: 'setup',
    description: 'Setup or change your guilds configuration.',
    aliases: ['setup', 'config'],
    usage: '',
    category: 'Guild',
    cooldown: 25,
    async execute(client, message, args, Discord) {
        const guildId = message.guild.id
        if (message.member.hasPermission("ADMINISTRATOR") || message.member.hasPermission("MANAGE_GUILD")) {
            let productChannel = "NONE"
            let blacklistChannel = "NONE"
            let csRole = "NONE"
            message.channel.send(new Discord.MessageEmbed()
                .setColor(client.config.colors.neutral)
                .setTitle(`Welcome to the SkySys setup guide!`)
                .setTimestamp()
                .setFooter(message.author.username, message.author.displayAvatarURL()))
            const filter = m => m.author.id === message.author.id
            const collector = message.channel.createMessageCollector(filter, { max: '1', maxMatches: "1", time: "200000" })
            const beginEmbed = new Discord.MessageEmbed()
                .setColor(client.config.colors.neutral)
                .setTitle("What channel do you wanna use for posting products?\n\nSay **skip** to skip.\nSay **cancel** to cancel.")
                .setFooter(message.author.username, message.author.displayAvatarURL())
                .setTimestamp()
            message.channel.send(beginEmbed)

            collector.on("collect", async m => {
                if (m.content === 'cancel' || m.content === 'Cancel') {
                    message.channel.send('**Cancelled prompt.**')
                    return
                } else {
                    if (m.content === 'skip' || m.content === 'Skip') {
                        message.channel.send('**Skipped prompt.**')
                    } else {
                        productChannel = m.content.substring(2).substring(0, 18)
                    }
                    const collectorTwo = message.channel.createMessageCollector(filter, { max: '1', maxMatches: "1", time: "200000" })
                    const nextEmbed = new Discord.MessageEmbed()
                        .setColor(client.config.colors.neutral)
                        .setTitle("What channel do you wanna use for posting blacklists?\n\nSay **skip** to skip.\nSay **cancel** to cancel.")
                        .setFooter(message.author.username, message.author.displayAvatarURL())
                        .setTimestamp()
                    message.channel.send(nextEmbed)
                    collectorTwo.on("collect", async mTwo => {
                        if (mTwo.content === 'cancel' || mTwo.content === 'Cancel') {
                            message.channel.send('**Cancelled prompt.**')
                            return
                        } else {
                            if (mTwo.content === 'skip' || mTwo.content === 'Skip') {
                                message.channel.send('**Skipped prompt.**')
                            } else {
                                blacklistChannel = mTwo.content.substring(2).substring(0, 18)
                            }
                            const otherEmbed = new Discord.MessageEmbed()
                                .setColor(client.config.colors.neutral)
                                .setTitle("What role do you want to use for customer services & maintenance?\n\nSay **skip** to skip.\nSay **cancel** to cancel.")
                                .setFooter(message.author.username, message.author.displayAvatarURL())
                                .setTimestamp()
                            message.channel.send(otherEmbed)
                            const collectorThree = message.channel.createMessageCollector(filter, { max: '1', maxMatches: "1", time: "200000" })
                            collectorThree.on("collect", async mThree => {
                                if (mThree.content === 'cancel' || mThree.content === 'Cancel') {
                                    message.channel.send('**Cancelled prompt.**')
                                    return
                                } else {
                                    if (mThree.content === 'skip' || mThree.content === 'Skip') {
                                        message.channel.send('**Skipped prompt.**')
                                    } else {
                                        csRole = mThree.mentions.roles.first().id
                                    }
                                    await mongo().then(async (mongoclient) => {
                                        try {
                                            const db = mongoclient.db(`guild-${guildId}`)
                                            const collection = db.collection("config")
                                            await collection.deleteOne(
                                                {
                                                    type: "guild"
                                                },
                                            );
                                            await collection.insertOne(
                                                {
                                                    type: "guild",
                                                    productChannelId: productChannel,
                                                    blacklistChannelId: blacklistChannel,
                                                    customerServiceRoleId: csRole,
                                                },
                                                {
                                                    upsert: true,
                                                }
                                            )
                                        } finally {
                                            mongoclient.close()
                                            message.channel.send(new Discord.MessageEmbed()
                                                .setColor(client.config.colors.success)
                                                .setTitle(`Successfully setup your guild with SkySys!`)
                                                .setTimestamp()
                                                .setFooter(message.author.username, message.author.displayAvatarURL()))
                                            return require('./faq.js').execute(client, message, args, Discord)
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    }
}

