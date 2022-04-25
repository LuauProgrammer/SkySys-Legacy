
module.exports = (Discord, client) => {
    client.user.setActivity("s!help", {
        type: "LISTENING"
    });
    console.log(`Logged in under: ${client.user.username}#${client.user.discriminator}`)
}