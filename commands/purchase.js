const mongo = require('../mongo')
const rbx = require("noblox.js")

module.exports = {
  name: 'purchase',
  description: 'Purchase products from the marketplace.',
  aliases: ['buy'],
  usage: '[product]',
  category: 'Marketing',
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
    if (!args[0]) {
      return message.channel.send(new Discord.MessageEmbed()
        .setColor(client.config.colors.error)
        .setTitle("Error")
        .setDescription(`Please specify a product to buy!`)
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
        if (!productResults) {
          return message.channel.send(new Discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setTitle(`Product does not exist.`)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL()))
        }
        if (await rbx.getOwnership(robloxID, productResults.purchaseId, "Asset")) {
          return message.channel.send(new Discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setTitle(`You already own this product!`)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL()))
        }
        const filter = m => m.author.id === message.author.id
        const collector = message.channel.createMessageCollector(filter, { max: '1', maxMatches: "1", time: "200000" })
        const robloxEmbed = new Discord.MessageEmbed()
          .setColor(client.config.colors.neutral)
          .setTitle(`Purchase the following Gamepass \n\nhttps://www.roblox.com/catalog/${productResults.purchaseId} \n Make sure your DMs are **OPEN** after completion.\n\nSay **done** when complete.\nSay **cancel** to cancel.`)
          .setFooter(message.author.username, message.author.displayAvatarURL())
          .setTimestamp()
        msg.channel.send(robloxEmbed)

        collector.on("collect", async m => {
          if (m.content === 'cancel' || m.content === 'Cancel') {
            message.channel.send('**Cancelled prompt.**')
            return
          } else if (m.content === 'done' || m.content === 'Done') {
            let owned = await rbx.getOwnership(robloxID, productResults.purchaseId, "Asset")
            if (owned) {
              const token = `${new Date().valueOf()}-${guildId}-${robloxID + new Date().getUTCMilliseconds()}`
              await mongo().then(async (mongoclient) => {
                try {
                  const db = mongoclient.db(`guild-${guildId}`)
                  const collection = db.collection(`inventory`)
                  await collection.insertOne(
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
                } finally {
                  const verified = new Discord.MessageEmbed()
                    .setColor(client.config.colors.success)
                    .setTitle("Successfully purchased item! Please check your DMs for your product key & product file!")
                    .setFooter(message.author.username, message.author.displayAvatarURL())
                    .setTimestamp()
                  msg.channel.send(verified)
                  message.author.send(new Discord.MessageEmbed()
                    .setColor(client.config.colors.success)
                    .setTitle(`Thank you for your purchase! Your product activation key & product is located below. Thank you for buying from ${message.guild.name}! \n\nProduct Key:\n${token} \n\nAsset File:`)
                    .setDescription(`${productResults.fileMediaLink}`)
                    .setTimestamp()
                    .setFooter(message.author.username, message.author.displayAvatarURL()))
                }
              })
            }
          }
        })
      } finally {
        mongoclient.close()
      }
    })
  }
}

