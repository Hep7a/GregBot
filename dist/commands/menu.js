"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../struct/command");
const discord_js_1 = require("discord.js");
const util_1 = require("../util");
class Menu extends command_1.Command {
    constructor() {
        super("menu");
    }
    exec(client, msg, args) {
        const boop = (0, util_1.createButton)("boop");
        const doop = (0, util_1.createButton)("doop");
        const goop = (0, util_1.createButton)("goop");
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(boop, doop, goop);
        msg.channel.send({
            content: "hehehe",
            components: [row]
        });
    }
}
exports.default = Menu;
