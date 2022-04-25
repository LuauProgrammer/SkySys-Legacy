const mongo = require('../mongo')
const rbx = require("noblox.js")

module.exports = {
    name: 'register',
    description: 'Registers you in the User Database.',
    aliases: ['verify'],
    usage: '',
    category: 'User',
    cooldown: 25,
    async execute(client, message, args, Discord) {
        const guildId = message.guild.id
        const userId = message.author.id
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
                if (uresults) {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setTitle(`User is already registered!`)
                        .setTimestamp()
                        .setFooter(message.author.username, message.author.displayAvatarURL()))


                } else {

                    let msg = message


                    function makeid() {
                        var text = "";
                        var selectFruit = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😲', '😝', '🤑', '🤯', '😭', '😑', '😶', '😋', '🙆', '👉', '👇', '🧠', '💼', '👮🏻', '👍🏼', '👎🏼', '🐵', '🌨', '☁️', '💧', '🎬', '🎧', '🎮', '🎲', '🏅', '🥇', '🥈', '🥉', '🏆', '🏒', '🍎', '🍫', '🍿', '🍪', '🥛', '🍽', '🍴', '🐑', '🦀', '🐔', '🐭', '🦊', '🐧', '🐞', '🌍', '🌏', '🌕', '🌖', '🌚', '🌝', '🌵', '🎄', '🌲', '☀️', '⛅️', '☔️', '🍋']; // Emoji list This can be used for words.
                        text += selectFruit[Math.floor(Math.random() * selectFruit.length)];
                        text += selectFruit[Math.floor(Math.random() * selectFruit.length)];
                        text += selectFruit[Math.floor(Math.random() * selectFruit.length)];
                        text += selectFruit[Math.floor(Math.random() * selectFruit.length)];
                        return text;
                    }

                    const filter = m => m.author.id === message.author.id
                    const collector = message.channel.createMessageCollector(filter, { max: '1', maxMatches: "1", time: "200000" })
                    const robloxEmbed = new Discord.MessageEmbed()
                        .setColor(client.config.colors.neutral)
                        .setTitle("What's your ROBLOX username?")
                        .setFooter(message.author.username, message.author.displayAvatarURL())
                        .setTimestamp()
                    msg.channel.send(robloxEmbed)

                    collector.on("collect", async m => {
                        if (m.content === 'cancel' || m.content === 'Cancel') {
                            message.channel.send('**Cancelled prompt.**')
                            return
                        }
                        try {
                            await rbx.getIdFromUsername(m.content)
                        } catch (err) {
                            mongoclient.close()
                            return message.channel.send(new Discord.MessageEmbed()
                                .setColor(client.config.colors.error)
                                .setTitle(`Could not find specified user!`)
                                .setTimestamp()
                                .setFooter(message.author.username, message.author.displayAvatarURL()))
                        }
                        rbx.getIdFromUsername(m.content).then(async robloxID => {
                            const newString = makeid() + makeid() + makeid() + makeid() + makeid()
                            const foundUsername = new Discord.MessageEmbed()
                                .setColor(client.config.colors.neutral)
                                .setTitle("Hello **" + m.content + "**, to verify that you are that user. Please put this in your bio. \n `" + newString + "`\n\nSay **done** when complete.\nSay **cancel** to cancel. ")
                                .setFooter(message.author.username, message.author.displayAvatarURL())
                                .setTimestamp()
                            msg.channel.send(foundUsername)
                            const collector2 = message.channel.createMessageCollector(filter, { max: '1', maxMatches: "1", time: "200000" })
                            collector2.on('collect', async mag => {
                                if (mag.content.includes('done') & mag.content.includes("done") && mag.author.id == message.author.id) {
                                    const fetchingBlurb = new Discord.MessageEmbed()
                                        .setColor(client.config.colors.neutral)
                                        .setTitle("Fetching your emojis, please wait as I am going to fetch it.")
                                        .setFooter(message.author.username, message.author.displayAvatarURL())
                                        .setTimestamp()
                                    msg.channel.send(fetchingBlurb)
                                    setTimeout(async () => {
                                        rbx.getBlurb(robloxID).then(async blurb => {
                                            if (blurb.includes(newString)) {
                                                const verified = new Discord.MessageEmbed()
                                                    .setColor(client.config.colors.success)
                                                    .setTitle("You have now been registered in the User Database.")
                                                    .setFooter(message.author.username, message.author.displayAvatarURL())
                                                    .setTimestamp()
                                                msg.channel.send(verified)
                                                const userInfo = {
                                                    userId,
                                                    guildId,
                                                    robloxID,
                                                }
                                                await mongo().then(async (mongoclient) => {
                                                    try {
                                                        const db = mongoclient.db(`guild-${guildId}`)
                                                        const collection = db.collection("users")
                                                        await collection.findOneAndUpdate(
                                                            {
                                                                userId,
                                                            },

                                                            {
                                                                $set: userInfo,
                                                            },
                                                            {
                                                                upsert: true,
                                                            }
                                                        )
                                                    } finally {
                                                        mongoclient.close()
                                                    }
                                                })
                                            } else {
                                                const err = new Discord.MessageEmbed()
                                                    .setColor(client.config.colors.error)
                                                    .setTitle("Could not find verification code.")
                                                    .setFooter(message.author.username, message.author.displayAvatarURL())
                                                    .setTimestamp()
                                                msg.channel.send(err)
                                            }
                                        })
                                    }, 5000)
                                } else
                                    if (mag.content.includes('cancel') && mag.author.id == message.author.id) {
                                        message.channel.send('**Cancelled prompt.**')
                                        return
                                    }
                            })
                        })
                    })
                }
            } finally {
                mongoclient.close()
            }
        })
    }
}