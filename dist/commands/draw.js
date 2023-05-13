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
const command_1 = require("../struct/command");
const discord_js_1 = require("discord.js");
const util_1 = require("../util");
const screen_1 = require("../struct/components/screen");
class Draw extends command_1.Command {
    constructor() {
        super("draw");
    }
    exec(client, msg, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const screen = new DrawingScreen();
            screen.start(msg);
        });
    }
}
exports.default = Draw;
class DrawingScreen extends screen_1.BaseScreen {
    get disabledControls() {
        return {
            "left": this.currPos[1] <= 0 ? true : false,
            "right": this.currPos[1] >= this.grid[this.currPos[0]].length - 1 ? true : false,
            "up": this.currPos[0] <= 0 ? true : false,
            "down": this.currPos[0] >= this.grid.length - 1 ? true : false
        };
    }
    constructor() {
        super();
        this.currColor = screen_1.ScreenKeys.EMPTY;
        this.currPos = [3, 3];
        this.toggled = false;
        this.coveredColor = screen_1.ScreenKeys.EMPTY;
    }
    start(msg) {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.setPos([3, 3]);
            _super.start.call(this, msg);
        });
    }
    onButtonClick(interaction) {
        switch (interaction.customId) {
            case "draw-random":
                const colors = ["EMPTY", "RED", "GREEN", "BLUE"];
                for (let i = 0; i < this.grid.length; i++) {
                    for (let j = 0; j < this.grid[i].length; j++) {
                        this.setPixel([i, j], screen_1.ScreenKeys[(0, util_1.randomize)(colors.length)]);
                    }
                }
                this.update(interaction);
                break;
            case "draw-toggle":
                this.toggled = !this.toggled;
                interaction.reply({
                    content: this.toggled ? "Toggled pen on." : "Toggled pen off.",
                    ephemeral: true
                });
                break;
            case "draw-fill":
                for (let i = 0; i < this.grid.length; i++) {
                    for (let j = 0; j < this.grid.length; j++) {
                        this.setPixel([i, j], this.currColor);
                    }
                }
                this.update(interaction);
                break;
        }
        if (interaction.customId.startsWith("draw-color")) {
            const color = interaction.customId.split("-")[2];
            this.currColor = screen_1.ScreenKeys[color.toUpperCase()];
            interaction.reply({
                content: `Set color to ${color}`,
                ephemeral: true
            });
        }
        if (interaction.customId.startsWith("draw-dir")) {
            const dict = {
                "up": [-1, 0],
                "down": [1, 0],
                "left": [0, -1],
                "right": [0, 1]
            };
            const direction = interaction.customId.split("-")[2];
            const posX = this.currPos[0] + dict[direction][0];
            const posY = this.currPos[1] + dict[direction][1];
            this.setPos([posX, posY]);
            this.update(interaction);
        }
    }
    generateActions() {
        const randomBtn = (0, util_1.createButton)("draw-random", "Random");
        const togglePen = (0, util_1.createButton)("draw-toggle", "Toggle");
        const fillBtn = (0, util_1.createButton)("draw-fill", "Fill");
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(randomBtn, togglePen, fillBtn);
        const redColor = (0, util_1.createButton)("draw-color-red", "Red", "RED");
        const blueColor = (0, util_1.createButton)("draw-color-blue", "Blue", "BLUE");
        const greenColor = (0, util_1.createButton)("draw-color-green", "Green", "GREEN");
        const blackColor = (0, util_1.createButton)("draw-color-black", "Black", "GRAY");
        const colors = new discord_js_1.ActionRowBuilder()
            .addComponents(redColor, blueColor, greenColor, blackColor);
        const dirNames = ["Left", "Right", "Up", "Down"];
        let buttons = [];
        for (let i = 0; i < dirNames.length; i++) {
            const button = (0, util_1.createButton)(`draw-dir-${dirNames[i].toLowerCase()}`, dirNames[i]).setDisabled(this.disabledControls[dirNames[i].toLowerCase()]);
            buttons.push(button);
        }
        const directions = new discord_js_1.ActionRowBuilder()
            .addComponents(...buttons);
        return [row, colors, directions];
    }
    setPos(pos) {
        this.prevPos = this.currPos;
        this.currPos = pos;
        this.coveredColor = this.grid[pos[0]][pos[1]];
        this.setPixel(this.prevPos, this.toggled ? this.currColor : this.coveredColor);
        this.setPixel(this.currPos, screen_1.ScreenKeys.YELLOW);
        console.log(this.currPos, this.disabledControls);
    }
}
