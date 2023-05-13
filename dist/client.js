"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotClient = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
class BotClient extends discord_js_1.Client {
    constructor(config) {
        var _a;
        super({
            intents: [
                "Guilds",
                "GuildMessages",
                "MessageContent"
            ]
        });
        this.commands = new discord_js_1.Collection();
        this.token = config.token;
        this.prefix = (_a = config.prefix) !== null && _a !== void 0 ? _a : "!";
    }
    registerCommand(command) {
        console.log(`Registering command: ${command.name}`);
        this.commands.set(command.name, command);
    }
    loadCommands(dir) {
        for (const cmdDir of (0, fs_1.readdirSync)(dir)) {
            if (!cmdDir.endsWith(".js"))
                continue;
            const cmdPath = `${dir}/${cmdDir}`;
            if ((0, fs_1.lstatSync)(cmdPath).isDirectory())
                this.loadCommands(cmdPath);
            else
                Promise.resolve(`${cmdPath}`).then(s => require(s)).then(({ default: commandClass }) => {
                    const command = new commandClass();
                    this.registerCommand(command);
                })
                    .catch(e => {
                    console.log(`Failed to load path ${cmdPath}`);
                });
        }
    }
    handleMessage(msg) {
        if (msg.author.bot)
            return;
        if (!msg.content.startsWith(this.prefix))
            return;
        const args = msg.content.toLowerCase().slice(1).split(" ");
        if (this.commands.has(args[0]))
            this.commands.get(args[0]).exec(this, msg, args);
    }
    start(startMsg) {
        this.on("ready", () => {
            console.log(startMsg !== null && startMsg !== void 0 ? startMsg : "balls");
        });
        this.on("messageCreate", msg => {
            this.handleMessage(msg);
        });
        this.login(this.token);
    }
}
exports.BotClient = BotClient;
