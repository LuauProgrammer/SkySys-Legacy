const mongo = require('../mongo')
const rbx = require("noblox.js")

module.exports = {
    name: 'products',
    description: 'Shows all products available on the marketplace.',
    aliases: ['market', 'buyableproducts'],
    usage: '',
    category: 'User',
    cooldown: 5,
    async execute(client, message, args, Discord) {
        const guildId = message.guild.id
        await mongo().then(async (mongoclient) => {
            try {

                const db = mongoclient.db(`guild-${guildId}`)
                const collection = db.collection(`products`)
                const results = await collection.find()

                if (!results) {
                    return message.author.send(new Discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setTitle(`No products found.`)
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL()))
                } else {
                    let embed = new Discord.MessageEmbed()
                        .setColor(client.config.colors.neutral)
                        .setTitle("Currently Purchasable Products:")
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL())
                    let msg = await message.channel.send(embed)
                    await results.forEach(async function (document) {
                        embed.addFields({
                            name: document.productName, value: `https://www.roblox.com/catalog/${document.purchaseId}\n\n`
                        })
                        msg.edit(embed)
                    });
                    mongoclient.close()
                }

            } catch (err) {
                console.log(err)
                mongoclient.close()
                return message.channel.send(new Discord.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setTitle("An error occurred. Try again.")
                    .setTimestamp()
                    .setFooter(message.author.username, message.author.displayAvatarURL()))
            }
        })
    }

}


