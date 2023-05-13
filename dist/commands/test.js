"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../struct/command");
class Ping extends command_1.Command {
    constructor() {
        super("test");
        this.x = 0;
    }
    exec(client, msg) {
        msg.channel.send(`Test: ${this.x}`);
        this.x += 1;
    }
}
exports.default = Ping;
