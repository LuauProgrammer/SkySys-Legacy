const { ShardingManager } = require('discord.js');
const { totalShards } = require("./utils/config.json");
const config = require("./utils/config.json");

const shards = new ShardingManager("./main.js", {
    token: process.env.TOKEN || config.token,
    totalShards,
})

shards.on("shardCreate", shard => {
    shard.on("ready", () => {
        console.log(`Launched Shard: #${shard.id}`)
    });
});

shards.on('error', error => {
    console.error(`Shard failed to Launch: ${error}`)
})


shards.spawn(shards.totalShards, 100000);