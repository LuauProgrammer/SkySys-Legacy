module.exports = {
    name: 'faq',
    description: "Important FAQ & Information to assist you with SkySys.",
    aliases: ['information'],
    usage: '',
    category: 'Info',
    cooldown: 0,
    async execute(client, message, args, Discord) {
        return message.channel.send(new Discord.MessageEmbed()
            .setColor(client.config.colors.neutral)
            .setTitle(`Important FAQ & Information`)
            .setDescription("[Click here to invite the bot to your server!](https://discord.com/api/oauth2/authorize?client_id=883124874112016405&permissions=137439865872&scope=bot)")
            .addField("Integrate our module into your code!", "Integrating our [module](https://www.roblox.com/library/8410306364/AuthorizationModule) is the first step to utilizing our feature rich token authorization system.")
            .addField("Obfuscate your code!", "Obfuscating your code will make it tougher for your scripted products to be leaked. I suggest using [Boronide](https://discord.gg/boronide) as it's an amazing free & paid obfuscator.")
            .addField("Why can't I use a gamepass for my products?", "Currently, SkySys only supports using T-Shirt IDs for products. We apologize for the inconvenience.")
            .addField("Help! I need help!", "We've all been there at one point. You can come visit the [Sky Systems Official Discord](https://discord.gg/ACJM48N363) to get support.")
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL()))
    }
}