const { MongoClient } = require('mongodb');
const config = require("./utils/config.json");
const client = new MongoClient(process.env.MONGOPATH || config.mongopath);

module.exports = async () => {
  await client.connect()
  return client
}
