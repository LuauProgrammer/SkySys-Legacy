const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongo = require("./mongo.js");

const listener = app.listen(process.env.PORT, () => {
    console.log("Listening on port: " + listener.address().port);
});

app.get("/", (request, response) => {
    response.sendStatus(200)
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.post("/authorize/:id", async (request, response) => {
    await mongo().then(async (mongoclient) => {
        const tokenString = request.body.token.split("-")
        const guildId = tokenString[1]
        if (!guildId) return response.status(200).send({ status: false, message: "Token Formatted Incorrectly" });
        const db = mongoclient.db(`guild-${guildId}`)
        const collection = db.collection("inventory")
        const results = await collection.findOne({ "productKey": String(request.body.token), "productName": request.body.assetName })
        if (!results) {
            return response.status(200).send({ status: false, message: "Token Invalid" });
        } else {
            if (results.productWhitelist === String(request.params.id)) {
                return response.status(200).send({ status: true, message: "Authorized" });
            } else return response.status(200).send({ status: false, message: "Invalid whitelist" });
        }
    })
});
