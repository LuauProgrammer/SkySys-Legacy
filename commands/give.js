const mongo = require('../mongo')
const rbx = require("noblox.js")

module.exports = {
    name: 'give',
    description: 'Give a product to a user.',
    aliases: ['gift'],
    usage: '[mention] [product]',
    category: 'Customer Service',
    cooldown: 25,
    async execute(client, message, args, Discord) {
        if (!message.mentions.users.first()) {
            return message.channel.send(new Discord.MessageEmbed()
                .setColor(client.config.colors.error)
                .setTitle(`No user specified`)
                .setTimestamp()
                .setFooter(message.author.username, message.author.displayAvatarURL()))
        }
        const guildId = message.guild.id
        const userId = message.mentions.users.first().id
        let robloxID
        let guildtbl
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
                } else {
                    guildtbl = gresults
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
        if (!guildtbl) return
        if (!guildtbl.customerServiceRoleId) {
            if (message.member.hasPermission("ADMINISTRATOR") || message.member.hasPermission("MANAGE_GUILD")) { } else return
        } else {
            if (message.member._roles.includes(guildtbl.customerServiceRoleId) || message.member.hasPermission("ADMINISTRATOR") || message.member.hasPermission("MANAGE_GUILD")) { } else return
        }
        await mongo().then(async (mongoclient) => {
            try {
                const db = mongoclient.db(`guild-${guildId}`)
                const collection = db.collection("users")
                const results = await collection.findOne({
                    userId,
                })
                if (!results) {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setTitle(`Specified user is not registered!`)
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                }
                robloxID = results.robloxID
            } finally {
                mongoclient.close()
            }
        })
        if (!args[1]) {
            return message.channel.send(new Discord.MessageEmbed()
                .setColor(client.config.colors.error)
                .setTitle("Error")
                .setDescription(`Please specify a product to give!`)
                .setTimestamp()
                .setFooter(message.author.username, message.author.displayAvatarURL()))
        }
        if (!robloxID) return
        const product = message.content.split(' ').splice(2).join(' ')
        const msg = message
        await mongo().then(async (mongoclient) => {
            try {
                const db = mongoclient.db(`guild-${guildId}`)
                const collection = db.collection("products")
                const productResults = await collection.findOne({
                    productName: product,
                })
                if (!productResults) {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setTitle(`Product does not exist.`)
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                }
                const token = `${new Date().valueOf()}-${guildId}-${robloxID + new Date().getUTCMilliseconds()}`
                const newcollection = db.collection(`inventory`)
                await newcollection.insertOne(
                    {
                        productName: productResults.productName,
                        productKey: String(token),
                        productOwner: String(robloxID),
                        productWhitelist: String(robloxID),
                    },
                    {
                        upsert: true,
                    }
                )
                try {
                    message.mentions.users.first().send(new Discord.MessageEmbed()
                        .setColor(client.config.colors.success)
                        .setTitle(`You have been given a product! Your product activation key & product is located below. Thank you for using ${message.guild.name}! \n\nProduct Key:\n${token} \n\nAsset File:`)
                        .setDescription(productResults.fileMediaLink)
                        .addField(`Run s!getroles after requesting to get your join request handled!","https://www.roblox.com/groups/${client.config.id}`)
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                    const verified = new Discord.MessageEmbed()
                        .setColor(client.config.colors.success)
                        .setTitle("Successfully gave the user the product. They have been sent their product and key!")
                        .setFooter(message.author.username, message.author.displayAvatarURL())
                        .setTimestamp()
                    msg.channel.send(verified)
                } catch (err) {
                    console.log(err)
                    const error = new Discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setTitle("Couldn't DM the user their product and key. They have been sent to your DMs.")
                        .setFooter(message.author.username, message.author.displayAvatarURL())
                        .setTimestamp()
                    msg.channel.send(error)
                    message.author.send(new Discord.MessageEmbed()
                        .setColor(client.config.colors.success)
                        .setTitle(`The users product activation key & product is located below. \n\nProduct Key:\n${token} \n\nAsset File:`)
                        .setDescription(productResults.fileMediaLink)
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                }
            } finally {
                mongoclient.close()
            }
        })

    }
}

