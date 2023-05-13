"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const path_1 = require("path");
const bot = new client_1.BotClient({
    token: "OTY0MTA4NTc3ODAxMzc1Nzk1.GlYvBj.A0npyXOrq3PIhy_gQtHyAM3tQdHa9Xbx91NdQk"
});
let ioCommands = {
    "ooga": "booga",
    "bing": "bong"
};
bot.on("messageCreate", msg => {
    if (msg.author.bot)
        return;
    console.log(msg.author.username, msg.content);
    if (Object.keys(ioCommands).includes(msg.content.toLowerCase())) {
        msg.channel.send(ioCommands[msg.content.toLowerCase()]);
    }
});
bot.loadCommands((0, path_1.join)(__dirname, "commands"));
bot.start();
