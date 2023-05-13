"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameScreen = exports.BaseScreen = exports.ScreenKeys = void 0;
const discord_js_1 = require("discord.js");
const util_1 = require("../../util");
var ScreenKeys;
(function (ScreenKeys) {
    ScreenKeys["EMPTY"] = ":black_large_square:";
    ScreenKeys["RED"] = ":red_square:";
    ScreenKeys["GREEN"] = ":green_square:";
    ScreenKeys["BLUE"] = ":blue_square:";
    ScreenKeys["YELLOW"] = ":yellow_square:";
    ScreenKeys["EXPLODE"] = ":boom:";
})(ScreenKeys = exports.ScreenKeys || (exports.ScreenKeys = {}));
class BaseScreen {
    constructor() {
        this.grid = [];
        this.init();
    }
    init() {
        for (let i = 0; i < 7; i++) {
            this.grid[i] = [];
            for (let j = 0; j < 7; j++) {
                this.setPixel([i, j], ScreenKeys.EMPTY);
            }
        }
    }
    start(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            this.running = true;
            const response = yield msg.channel.send({
                content: this.render(),
                components: [...this.generateActions()]
            });
            const collector = response.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                filter: i => i.user.id === msg.author.id,
                time: 300000
            });
            collector.on('collect', i => {
                this.onButtonClick(i);
            });
            collector.on('end', () => {
                msg.channel.send("5 minutes have passed, activity terminated.");
                return;
            });
        });
    }
    end() {
        this.running = false;
    }
    render() {
        let str = "";
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (!this.grid[i][j])
                    this.grid[i][j] = ScreenKeys.EMPTY;
                str += `${this.grid[i][j]}`;
            }
            str += "\n";
        }
        return str;
    }
    setPixel(pos, key) {
        this.grid[pos[0]][pos[1]] = key;
    }
    update(interaction, sent, func, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sent)
                sent = false;
            console.log("updating", func, id, sent);
            yield interaction[sent ? "editReply" : "update"]({
                content: this.render(),
                components: [...this.generateActions()]
            });
            console.log("updated", func, id, sent);
        });
    }
}
exports.BaseScreen = BaseScreen;
class GameScreen extends BaseScreen {
    get disabledControls() {
        return {
            "left": this.currPos[1] <= 0 ? true : false,
            "right": this.currPos[1] >= this.grid[this.currPos[0]].length - 1 ? true : false,
            "up": this.currPos[0] <= 0 ? true : false,
            "down": this.currPos[0] >= this.grid.length - 1 ? true : false
        };
    }
    constructor(safety) {
        super();
        this.MOVEMENTS = {
            "left": [0, -1],
            "right": [0, 1],
            "up": [-1, 0],
            "down": [1, 0]
        };
        this.currColor = ScreenKeys.EMPTY;
        this.prevPos = [3, 3];
        this.currPos = [3, 3];
        this.safety = safety !== null && safety !== void 0 ? safety : true;
    }
    start(msg) {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.setPos(this.currPos);
            _super.start.call(this, msg);
        });
    }
    onButtonClick(interaction) {
        if (interaction.customId.startsWith("draw-dir")) {
            const direction = interaction.customId.split("-")[2];
            this.onMove(direction, interaction);
        }
    }
    generateActions() {
        const dirNames = ["Left", "Right", "Up", "Down"];
        let buttons = [];
        let disabled = !this.running;
        for (let i = 0; i < dirNames.length; i++) {
            const button = (0, util_1.createButton)(`draw-dir-${dirNames[i].toLowerCase()}`, dirNames[i]).setDisabled(!this.safety ? disabled : this.disabledControls[dirNames[i].toLowerCase()]);
            buttons.push(button);
        }
        const directions = new discord_js_1.ActionRowBuilder()
            .addComponents(...buttons);
        return [directions];
    }
    setPos(pos, color) {
        this.prevPos = this.currPos;
        this.setPixel(this.prevPos, ScreenKeys.EMPTY);
        this.currPos = pos;
        this.setPixel(this.currPos, color !== null && color !== void 0 ? color : ScreenKeys.YELLOW);
    }
}
exports.GameScreen = GameScreen;
