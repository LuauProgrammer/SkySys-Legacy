const mongo = require('../mongo')
const rbx = require("noblox.js")

module.exports = {
    name: 'ownedproducts',
    description: 'Lists what products you own and their related information.',
    aliases: ['inventory', 'boughtproducts'],
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
                    robloxID = uresults.robloxID
                }

            } finally {
                mongoclient.close()
            }
        })
        if (!robloxID) return
        await mongo().then(async (mongoclient) => {
            try {
                message.channel.send(new Discord.MessageEmbed()
                    .setColor(client.config.colors.neutral)
                    .setTitle("Please check your DMs with the bot.")
                    .setTimestamp()
                    .setFooter(message.author.username, message.author.displayAvatarURL()))
                const db = mongoclient.db(`guild-${guildId}`)
                const collection = db.collection(`inventory`)
                const results = await collection.find({
                    productOwner: String(robloxID),
                })

                if (!results) {
                    return message.author.send(new Discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setTitle(`No products found.`)
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                } else {
                    let embed = new Discord.MessageEmbed()
                        .setColor(client.config.colors.neutral)
                        .setTitle("Currently owned products:")
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL())
                    let msg = await message.author.send(embed)
                    await results.forEach(function (document) {
                        embed.addFields({
                            name: document.productName, value: `**Token:** ${document.productKey}\n**Whitelisted ID:** ${document.productWhitelist} \n\n`
                        })
                        msg.edit(embed)
                    });
                    mongoclient.close()
                }

            } catch {
                mongoclient.close()
                return message.channel.send(new Discord.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setTitle("An error occurred. Make sure your DMs are open.")
                    .setTimestamp()
                    .setFooter(message.author.username, message.author.displayAvatarURL()))
            }
        })
    }

}


