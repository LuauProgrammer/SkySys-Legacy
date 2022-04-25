const mongo = require('../mongo')

module.exports = {
    name: 'whitelist',
    description: 'Change the whitelist of an owned product.',
    aliases: ['authorize', 'changewhitelist'],
    usage: '',
    category: 'User',
    cooldown: 25,
    async execute(client, message, args, Discord) {
        const guildId = message.guild.id
        const userId = message.author.id
        let robloxID
        await mongo().then(async (mongoclient) => {
            try {
                const db = mongoclient.db(`guild-${guildId}`)
                const gcollection = db.collection("config")
                const ucollection = db.collection("users")
                const uresults = await ucollection.findOne({
                    userId,
                })
                const gresults = await gcollection.findOne({
                    type: "guild"
                })
                if (!gresults) {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setTitle(`Guild is not setup!`)
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                }
                if (!uresults) {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setTitle(`User is not registered!`)
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                } else {
                    robloxID = results.robloxID
                }

            } finally {
                mongoclient.close()
            }
        })
        try {
            message.author.createDM().then(dmchannel => {
                message.channel.send(new Discord.MessageEmbed()
                    .setColor(client.config.colors.neutral)
                    .setTitle("Please check your DMs with the bot.")
                    .setTimestamp()
                    .setFooter(message.author.username, message.author.displayAvatarURL()))
                message.author.send(new Discord.MessageEmbed()
                    .setColor(client.config.colors.neutral)
                    .setTitle(`Please provide the asset token to change the whitelist.\nSay **cancel** to cancel.`)
                    .setTimestamp()
                    .setFooter(message.author.username, message.author.displayAvatarURL()))
                const collector = new Discord.MessageCollector(dmchannel, dm => dm.author.id === message.author.id, { max: '1', maxMatches: "1", time: "200000" });
                collector.on('collect', async dm => {
                    if (dm.content === 'cancel' || dm.content === 'Cancel') {
                        message.channel.send('**Cancelled prompt.**')
                        return
                    } else {
                        await mongo().then(async (mongoclient) => {
                            try {
                                const db = mongoclient.db(`guild-${guildId}`)
                                const collection = db.collection(`inventory`)
                                const productresults = await collection.findOne({
                                    productKey: dm.content,
                                    productOwner: String(robloxID),
                                })
                                if (productresults) {
                                    const collector2 = new Discord.MessageCollector(dmchannel, dm => dm.author.id === message.author.id, { max: '1', maxMatches: "1", time: "200000" });
                                    message.author.send(new Discord.MessageEmbed()
                                        .setColor(client.config.colors.neutral)
                                        .setTitle(`Please provide the new UserId or GroupId to change the whitelist to.\nSay **cancel** to cancel.`)
                                        .setTimestamp()
                                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                                    collector2.on('collect', async dm2 => {
                                        if (dm2.content === 'cancel' || dm2.content === 'Cancel') {
                                            message.channel.send('**Cancelled prompt.**')
                                            return
                                        } else {
                                            const productInfo = {
                                                productWhitelist: String(dm2.content)
                                            }
                                            await collection.findOneAndUpdate(
                                                {
                                                    productKey: dm.content,
                                                    productOwner: String(robloxID),
                                                },
                                                {
                                                    $set: productInfo,
                                                },
                                                {
                                                    upsert: true,
                                                }
                                            )
                                        }
                                        mongoclient.close()
                                        return message.author.send(new Discord.MessageEmbed()
                                            .setColor(client.config.colors.success)
                                            .setTitle(`Product whitelist updated.`)
                                            .setTimestamp()
                                            .setFooter(message.author.username, message.author.displayAvatarURL()))
                                    })
                                } else {
                                    mongoclient.close()
                                    return message.author.send(new Discord.MessageEmbed()
                                        .setColor(client.config.colors.error)
                                        .setTitle(`Product could not be found!`)
                                        .setTimestamp()
                                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                                }
                            } catch {
                                mongoclient.close()
                            }
                        })
                    }
                })
            })
        } catch {
            return message.channel.send(new Discord.MessageEmbed()
                .setColor(client.config.colors.error)``
                .setTitle(`An error occurred. Make sure your DMs are open.`)
                .setTimestamp()
                .setFooter(message.author.username, message.author.displayAvatarURL()))
        }

    }

}


