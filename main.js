const Discord = require('discord.js');
const client = new Discord.Client();
const noblox = require("noblox.js");
client.config = require("./utils/config.json");
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

require('./proxy.js')

noblox.setCookie(process.env.COOKIE || client.config.cookie).then(function () {
    console.log("Logged into roblox.")
}).catch(function (err) {
    console.log("Unable to log in to roblox,", err)
});

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})

client.login(process.env.TOKEN || client.config.token)