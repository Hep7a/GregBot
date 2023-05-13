"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../struct/command");
class Random extends command_1.Command {
    constructor() {
        super("random");
    }
    exec(client, msg, args) {
        const max = parseInt(args[1]);
        if (isNaN(max)) {
            msg.channel.send("Invalid arguments.");
            return;
        }
        const rng = Math.floor(Math.random() * max) + 1;
        msg.channel.send(`Random number: ${rng}`);
    }
}
exports.default = Random;
