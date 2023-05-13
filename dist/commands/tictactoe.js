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
class TicTacToe extends command_1.Command {
    constructor() {
        super("tictactoe");
    }
    exec(client, msg, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = new TTTGame();
            game.start(msg);
        });
    }
}
exports.default = TicTacToe;
class TTTGame {
    constructor() {
        this.colors = {
            "?": discord_js_1.ButtonStyle.Secondary,
            "O": discord_js_1.ButtonStyle.Primary,
            "X": discord_js_1.ButtonStyle.Danger
        };
        this.winner = "?";
        this.grid = new Array(9).fill("?");
        this.playerTurn = true;
    }
    start(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield msg.channel.send({
                content: "Tic Tac Toe:",
                components: [...this.generateGrid()]
            });
            const collector = response.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                filter: i => i.user.id === msg.author.id,
                time: 120000
            });
            collector.on('collect', i => {
                this.onButtonClick(i);
            });
            collector.on('end', () => {
                msg.channel.send("2 minutes have passed, game terminated.");
                return;
            });
        });
    }
    generateGrid() {
        let rows = [];
        for (let i = 0; i < 3; i++) {
            let buttons = [];
            for (let j = 0; j < 3; j++) {
                const move = this.grid[i * 3 + j];
                const button = (0, util_1.createButton)(`tictactoe-${i}-${j}`, move, this.colors[move]);
                if (move !== "?" || this.winner !== "?")
                    button.setDisabled(true);
                buttons.push(button);
            }
            rows.push(new discord_js_1.ActionRowBuilder()
                .addComponents(...buttons));
        }
        return rows;
    }
    update(i) {
        i.update({
            content: this.winner === "?" ? "Tic Tac Toe:" : `Winner is ${this.winner}.`,
            components: [...this.generateGrid()]
        });
    }
    onButtonClick(i) {
        const btnInfo = i.customId.split("-");
        const row = parseInt(btnInfo[1]);
        const col = parseInt(btnInfo[2]);
        this.makeMove(row * 3 + col);
        this.cpuMove();
        this.update(i);
    }
    makeMove(index) {
        this.grid[index] = this.playerTurn ? "O" : "X";
        // Check if win
        const wins = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        for (let i = 0; i < wins.length; i++) {
            if (this.grid[wins[i][0]] === this.grid[wins[i][1]] &&
                this.grid[wins[i][1]] === this.grid[wins[i][2]] &&
                this.grid[wins[i][0]] !== "?") {
                this.winner = this.grid[wins[i][0]];
                return;
            }
        }
        this.playerTurn = !this.playerTurn;
    }
    cpuMove() {
        if (this.winner !== "?")
            return;
        let moves = [];
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] === "?")
                moves.push(i);
        }
        this.makeMove(moves[(0, util_1.randomize)(moves.length)]);
    }
}
