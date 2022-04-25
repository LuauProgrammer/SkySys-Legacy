const mongo = require('../mongo')
const rbx = require("noblox.js")
const fetch = require("node-fetch")

module.exports = {
    name: 'add',
    description: 'Add a new product.',
    aliases: ['addproduct'],
    usage: '[product]',
    category: 'Developer',
    cooldown: 25,
    async execute(client, message, args, Discord) {
        if (message.member.hasPermission("ADMINISTRATOR") || message.member.hasPermission("MANAGE_GUILD")) {
            const guildId = message.guild.id
            const userId = message.author.id
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
            if (!robloxID) return
            if (!args[0]) {
                return message.channel.send(new Discord.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setTitle(`Please provide a product name!`)
                    .setTimestamp()
                    .setFooter(message.author.username, message.author.displayAvatarURL()))
            }

            const product = message.content.split(' ').splice(1).join(' ')
            const msg = message
            await mongo().then(async (mongoclient) => {
                try {
                    const db = mongoclient.db(`guild-${guildId}`)
                    const collection = db.collection("products")
                    const productResults = await collection.findOne({
                        productName: product,
                    })
                    if (productResults) {
                        return message.channel.send(new Discord.MessageEmbed()
                            .setColor(client.config.colors.error)
                            .setTitle(`Product already exists.`)
                            .setTimestamp()
                            .setFooter(message.author.username, message.author.displayAvatarURL()))
                    }
                    const filter = m => m.author.id === message.author.id
                    const collector = message.channel.createMessageCollector(filter, { max: '1', maxMatches: "1", time: "200000" })
                    let id
                    let des
                    const desEmbed = new Discord.MessageEmbed()
                        .setColor(client.config.colors.neutral)
                        .setTitle(`Provide a description for the product. You can attach an image that will be embedded with the description.\nSay **cancel** to cancel.`)
                        .setFooter(message.author.username, message.author.displayAvatarURL())
                        .setTimestamp()
                    msg.channel.send(desEmbed)

                    collector.on("collect", async desm => {
                        if (desm.content === 'cancel' || desm.content === 'Cancel') {
                            message.channel.send('**Cancelled prompt.**')
                            return
                        } else {
                            des = desm.content
                            const collector2 = message.channel.createMessageCollector(filter, { max: '1', maxMatches: "1", time: "200000" })
                            const robloxEmbed = new Discord.MessageEmbed()
                                .setColor(client.config.colors.neutral)
                                .setTitle(`Say the ROBLOX asset ID to continue.\nSay **cancel** to cancel.`)
                                .setFooter(message.author.username, message.author.displayAvatarURL())
                                .setTimestamp()
                            msg.channel.send(robloxEmbed)
                            collector2.on("collect", async m => {
                                if (m.content === 'cancel' || m.content === 'Cancel') {
                                    message.channel.send('**Cancelled prompt.**')
                                    return
                                } else if (!isNaN(m.content)) {
                                    id = m.content
                                    try {
                                        message.author.createDM().then(dmchannel => {
                                            message.channel.send(new Discord.MessageEmbed()
                                                .setColor(client.config.colors.neutral)
                                                .setTitle(`Please check your DMs with the bot.\nSay **cancel** to cancel in the bots DMs.`)
                                                .setTimestamp()
                                                .setFooter(message.author.username, message.author.displayAvatarURL()))
                                            message.author.send(new Discord.MessageEmbed()
                                                .setColor(client.config.colors.neutral)
                                                .setTitle(`Please provide the file to use.\nSay **cancel** to cancel.`)
                                                .setTimestamp()
                                                .setFooter(message.author.username, message.author.displayAvatarURL()))
                                            const dmcollector = new Discord.MessageCollector(dmchannel, dm => dm.author.id === message.author.id, { max: '1', maxMatches: "1", time: "200000" });
                                            dmcollector.on('collect', async dm => {
                                                if (dm.attachments.size !== 0) {
                                                    const attachment = dm.attachments.first();
                                                    const url = attachment.url;
                                                    const productInformation = await rbx.getProductInfo(id)
                                                    let messageid
                                                    let imgurl = desm.attachments.first() || "https://tr.rbxcdn.com/d045d3d917f6de9e34130a24fddefbed/150/150/Image/Png"
                                                    if (imgurl !== "https://tr.rbxcdn.com/d045d3d917f6de9e34130a24fddefbed/150/150/Image/Png") {
                                                        imgurl = desm.attachments.first().url
                                                    }
                                                    try {
                                                        var channel = client.channels.cache.find(channel => channel.id === guildtbl.productChannelId);
                                                        let notify = new Discord.MessageEmbed()
                                                            .setColor(client.config.colors.neutral)
                                                            .setTitle(product)
                                                            .setDescription(des)
                                                            .addField("Price", `${productInformation.PriceInRobux}R$`)
                                                            .addField("URL", `https://www.roblox.com/catalog/${id}`)
                                                            .setImage(imgurl)
                                                            .setFooter(`Use s!buy ${product} to buy this product`, "https://cdn.discordapp.com/avatars/883124874112016405/4710bd50847939736c8cc9ce3652615c.png")
                                                            .setTimestamp()
                                                        let sent = await channel.send(notify)
                                                        console.log(sent)
                                                        messageid = sent.id
                                                    } catch {

                                                    }
                                                    const productInfo = {
                                                        fileMediaLink: url,
                                                        messageId: messageid,
                                                        purchaseId: id,
                                                    }
                                                    await mongo().then(async (mongoclient) => {
                                                        try {
                                                            const db = mongoclient.db(`guild-${guildId}`)
                                                            const collection = db.collection("products")
                                                            await collection.findOneAndUpdate(
                                                                {
                                                                    productName: product,
                                                                },

                                                                {
                                                                    $set: productInfo,
                                                                },
                                                                {
                                                                    upsert: true,
                                                                }
                                                            )
                                                        } finally {
                                                            mongoclient.close()
                                                            const done = new Discord.MessageEmbed()
                                                                .setColor(client.config.colors.success)
                                                                .setTitle("Successfully put item on-sale!")
                                                                .setDescription("**Do not delete the message with the file or else your product will stop working.")
                                                                .setFooter(message.author.username, message.author.displayAvatarURL())
                                                                .setTimestamp()
                                                            message.author.send(done)
                                                        }
                                                    })
                                                } else if (m.content === 'cancel' || m.content === 'Cancel') {
                                                    message.author.send('**Cancelled prompt.**')
                                                    return
                                                }
                                            })
                                        })
                                    } catch (err) {
                                        return message.channel.send(new Discord.MessageEmbed()
                                            .setColor(client.config.colors.error)``
                                            .setTitle(`An error occurred. Make sure your DMs are open.`)
                                            .setTimestamp()
                                            .setFooter(message.author.username, message.author.displayAvatarURL()))
                                    }
                                }
                            })

                        }

                    })


                } finally {
                    mongoclient.close()
                }

            })

        }
    }
}
